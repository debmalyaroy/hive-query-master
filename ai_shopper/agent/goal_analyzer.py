# ai_shopper/agent/goal_analyzer.py

import os
import json
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage

class GoalAnalyzer:
    """
    Decomposes the user's high-level shopping goal into specific, actionable sub-tasks
    and structured data using an LLM.
    """

    def __init__(self, model_name="gpt-3.5-turbo"):
        load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        if not self.openai_api_key:
            print("Warning: OPENAI_API_KEY not found in ai_shopper/.env. GoalAnalyzer may not function.")
            self.llm = None
        else:
            self.llm = ChatOpenAI(model_name=model_name, temperature=0, openai_api_key=self.openai_api_key)

        self.system_prompt_template = """
You are an expert AI assistant for decomposing complex shopping goals into structured JSON.
Your task is to analyze the user's request and extract all relevant information.
The output MUST be a single JSON object. Do not include any text before or after the JSON object.

The JSON object should have the following top-level keys:
- "original_prompt": (string) The user's full original text.
- "search_queries": (array of strings) Suggested search queries for initial research.
- "product_categories_to_find": (array of objects) Each object represents a product category the user needs.
  Each product category object should have:
    - "category": (string) e.g., "hiking_boots", "jacket", "backpack", "trekking_poles", "water_bottle", "headlamp", "tent", "sleeping_bag".
    - "attributes": (array of strings) e.g., "Himalayan terrain", "weather-appropriate for Himalayas", "40-50L capacity", "waterproof", "lightweight", "sustainable".
    - "quantity": (integer) Default to 1 if not specified.
    - "optional": (boolean) True if the item seems optional, false otherwise. Default to false.
    - "notes": (string, optional) Any specific notes like "User already has socks."
- "constraints": (object) User-defined constraints.
  Should include:
    - "budget_total_INR": (integer, optional) Total budget in INR. Extract only numbers. If a range is given, take the maximum.
    - "preferences": (array of strings, optional) e.g., "sustainable brands", "specific brand X", "made in Y".
    - "exclusions": (array of strings, optional) e.g., "hiking socks", "color red".
- "trip_details": (object, optional) If the request mentions a trip.
  Should include:
    - "duration_days": (integer, optional)
    - "location_general": (string, optional) e.g., "Himalayas", "beach".
    - "location_specific": (string, optional) e.g., "Manali region", "Goa".
    - "month": (string, optional) e.g., "next month", "December".
    - "activity_type": (string, optional) e.g., "trekking", "camping", "skiing".

Guidelines:
- If a budget is mentioned, extract the numerical value. E.g., "₹40,000" or "40k INR" becomes 40000. If a range like "30-40k" is given, use the higher value (40000).
- "Sustainable" or "eco-friendly" should be listed as a preference AND as an attribute for products if applicable.
- Be comprehensive in extracting product categories. If the user says "all essential gear" for a specific activity, list common essentials for that activity.
- If quantity is not specified for an item, assume 1.
- If an item seems optional (e.g., user says "maybe trekking poles"), mark it as "optional": true.

Example user prompt: "I'm going on a 5-day trek in the Himalayas near Manali next month. My budget is ₹40,000. I need all the essential gear. I prefer sustainable brands and I already have hiking socks. Get me the best options."
Example JSON output for this prompt:
{
  "original_prompt": "I'm going on a 5-day trek in the Himalayas near Manali next month. My budget is ₹40,000. I need all the essential gear. I prefer sustainable brands and I already have hiking socks. Get me the best options.",
  "search_queries": [
    "essential gear for 5-day Himalayan trek Manali",
    "sustainable hiking boot brands Himalayas",
    "best weather-appropriate jackets for Himalayas trekking",
    "40-50L sustainable backpacks for trekking"
  ],
  "product_categories_to_find": [
    {"category": "hiking_boots", "attributes": ["Himalayan terrain appropriate", "sustainable"], "quantity": 1, "optional": false, "notes": "User already has hiking socks, so boots are primary footwear."},
    {"category": "jacket", "attributes": ["weather-appropriate for Himalayas", "waterproof", "windproof", "sustainable"], "quantity": 1, "optional": false},
    {"category": "backpack", "attributes": ["40-50L capacity", "trekking type", "sustainable"], "quantity": 1, "optional": false},
    {"category": "trekking_pants", "attributes": ["quick-dry", "comfortable for trekking", "sustainable"], "quantity": 2, "optional": false},
    {"category": "thermal_layers", "attributes": ["base layer", "mid layer", "sustainable"], "quantity": 2, "optional": false},
    {"category": "headlamp", "attributes": ["good battery life", "LED"], "quantity": 1, "optional": false},
    {"category": "water_bottles_or_hydration_pack", "attributes": ["reusable", "min 2L capacity total"], "quantity": 1, "optional": false},
    {"category": "sun_protection_hat", "attributes": ["wide-brimmed"], "quantity": 1, "optional": false},
    {"category": "gloves", "attributes": ["warm", "water-resistant (optional)"], "quantity": 1, "optional": false},
    {"category": "first_aid_kit", "attributes": ["personal trekking kit"], "quantity": 1, "optional": false}
  ],
  "constraints": {
    "budget_total_INR": 40000,
    "preferences": ["sustainable brands"],
    "exclusions": ["hiking socks"]
  },
  "trip_details": {
    "duration_days": 5,
    "location_general": "Himalayas",
    "location_specific": "Manali region",
    "month": "next month",
    "activity_type": "trekking"
  }
}
"""

    def decompose_goal(self, user_prompt: str) -> dict:
        """
        Analyzes the user's prompt using an LLM and breaks it down into a structured JSON object.

        Args:
            user_prompt: The raw input string from the user.

        Returns:
            A dictionary parsed from the LLM's JSON response.
            Returns an error dictionary if LLM is not available or parsing fails.
        """
        if not self.llm:
            return {"error": "LLM not initialized. Check OPENAI_API_KEY."}

        messages = [
            SystemMessage(content=self.system_prompt_template),
            HumanMessage(content=user_prompt),
        ]

        try:
            print(f"Sending prompt to LLM for goal decomposition: '{user_prompt[:100]}...'")
            response = self.llm.invoke(messages)
            response_content = response.content.strip()

            # Ensure the response is just the JSON object
            if response_content.startswith("```json"):
                response_content = response_content[7:]
            if response_content.startswith("```"):
                response_content = response_content[3:]
            if response_content.endswith("```"):
                response_content = response_content[:-3]
            response_content = response_content.strip()

            # print(f"\nRaw LLM Response:\n{response_content}\n") # For debugging

            parsed_json = json.loads(response_content)
            return parsed_json
        except json.JSONDecodeError as e:
            print(f"Error decoding JSON from LLM response: {e}")
            print(f"Problematic response content: {response_content}")
            return {"error": "Failed to parse LLM response as JSON.", "details": str(e), "raw_response": response_content}
        except Exception as e:
            print(f"An error occurred during LLM call: {e}")
            return {"error": "An error occurred during LLM call.", "details": str(e)}

if __name__ == '__main__':
    # This block is for testing the GoalAnalyzer directly.
    # It requires the .env file to be set up in ai_shopper/.env with an OPENAI_API_KEY.

    analyzer = GoalAnalyzer()

    if not analyzer.llm:
        print("Cannot run test: LLM not initialized. Make sure ai_shopper/.env contains a valid OPENAI_API_KEY.")
    else:
        sample_prompts_for_testing = [
            "I'm going on a 5-day trek in the Himalayas near Manali next month. My budget is ₹40,000. I need all the essential gear. I prefer sustainable brands and I already have hiking socks. Get me the best options.",
            "I need a new laptop for programming and light gaming. Budget around $1200. Should have a good keyboard and at least 16GB RAM. SSD is a must.",
            "Looking for birthday gift for my mom. She likes gardening and reading. Budget is 5000 INR."
        ]

        for i, prompt in enumerate(sample_prompts_for_testing):
            print(f"\n--- Test Prompt {i+1} ---")
            print(f"User Prompt: {prompt}")
            structured_data = analyzer.decompose_goal(prompt)

            print("\nStructured Output:")
            if "error" in structured_data:
                print(f"  Error: {structured_data['error']}")
                if "details" in structured_data:
                    print(f"  Details: {structured_data['details']}")
                if "raw_response" in structured_data and structured_data['raw_response']: # Only print if it has content
                    print(f"  Raw Response Snippet: {structured_data['raw_response'][:500]}...")
            else:
                # Pretty print the JSON
                print(json.dumps(structured_data, indent=2))
            print("--- End Test Prompt ---")
