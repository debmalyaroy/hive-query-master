# ai_shopper/agent/researcher.py

# In later phases, this will import and use tools from ai_shopper.tools
# from ai_shopper.tools.search_tool import SearchTool
# from ai_shopper.tools.ecommerce_api_tool import EcommerceApiTool
# from ai_shopper.tools.web_scraper_tool import WebScraperTool

class Researcher:
    """
    Manages the information gathering process based on decomposed tasks from GoalAnalyzer.
    For Phase C, this will return MOCK data.
    In later phases, it will use various tools (search engines, e-commerce APIs, web scrapers)
    to find product information, brand details, reviews, sustainability certifications, etc.
    """

    def __init__(self):
        # Initialize tools in later phases
        # self.search_tool = SearchTool()
        # self.ecommerce_tool = EcommerceApiTool()
        # self.scraper_tool = WebScraperTool()
        print("Researcher initialized (using mock data for Phase C).")

    def conduct_research(self, research_tasks: list[dict]) -> dict:
        """
        Executes research tasks. For Phase C, this returns MOCK findings.

        Args:
            research_tasks: A list of research tasks, typically derived from GoalAnalyzer's
                            `product_categories_to_find` list.
                            Example from main.py:
                            `[{"task_type": "find_product_category", "category_info": cat_obj_from_goal_analyzer}, ...]`
                            where `cat_obj_from_goal_analyzer` is like:
                            `{"category": "hiking_boots", "attributes": ["Himalayan terrain appropriate", "sustainable"], ...}`

        Returns:
            A dictionary containing compiled MOCK research findings, structured by category.
            Example:
            {
                "hiking_boots": [
                    {"name": "Mock Boot Alpha", "brand": "MockBrand", "price": 10000, "currency": "INR", "category": "hiking_boots", "attributes": ["mock_terrain_suitable", "mock_sustainable"], "sustainability_info": "Mocked as eco-friendly", "reviews_rating": 4.2, "product_url": "http://mock.com/boot_alpha"},
                    {"name": "Mock Boot Beta", "brand": "MockBrand", "price": 12000, "currency": "INR", "category": "hiking_boots", "attributes": ["mock_all_weather"], "sustainability_info": "Standard materials", "reviews_rating": 4.5, "product_url": "http://mock.com/boot_beta"}
                ],
                "jacket": [...]
            }
        """
        print(f"Researcher: Conducting MOCK research for tasks: {research_tasks}")
        mock_research_findings = {}

        for task in research_tasks:
            if task.get("task_type") == "find_product_category":
                category_info = task.get("category_info", {})
                category_name = category_info.get("category", "unknown_category")
                attributes = category_info.get("attributes", [])

                is_sustainable_requested = any("sustainable" in attr.lower() for attr in attributes)

                mock_products_for_category = []
                # Create 1 or 2 mock products for this category
                for i in range(1, 3): # Create two mock products
                    product_name = f"Mock {category_name.replace('_', ' ').title()} {chr(ord('A') + i -1)}" # Alpha, Beta
                    price = (100 + i*10) * (len(category_name) * 10) # Arbitrary price

                    mock_product = {
                        "name": product_name,
                        "brand": f"MockBrand{i}",
                        "price": price,
                        "currency": "INR", # Assuming INR for now based on GoalAnalyzer examples
                        "category": category_name,
                        "attributes": [f"mock_attr_{j}" for j in range(len(attributes) or 1)], # Mock attributes based on request
                        "sustainability_info": "Mocked as eco-friendly" if is_sustainable_requested and i == 1 else ("Standard materials" if i ==1 else "Recycled content (mock)"),
                        "reviews_rating": round(4.0 + (i * 0.2), 1),
                        "num_reviews": 50 + i * 20,
                        "product_url": f"http://mock.com/{category_name}/prod{i}",
                        "description": f"This is a great mock {product_name} with excellent features."
                    }
                    mock_products_for_category.append(mock_product)

                mock_research_findings[category_name] = mock_products_for_category
            else:
                # Handle other task types if any (e.g., "research_general_info") with mock data
                details = task.get("details", "general_research_topic")
                mock_research_findings[details] = [{"info": f"Mock general info about {details}"}]


        print(f"Researcher: Returning MOCK findings: {mock_research_findings}")
        return mock_research_findings

if __name__ == '__main__':
    researcher = Researcher()

    # Example task structure similar to what main.py would pass
    sample_goal_analyzer_output_categories = [
        {"category": "hiking_boots", "attributes": ["Himalayan terrain appropriate", "sustainable"], "quantity": 1, "optional": false, "notes": "User already has hiking socks, so boots are primary footwear."},
        {"category": "jacket", "attributes": ["weather-appropriate for Himalayas", "waterproof", "windproof"], "quantity": 1, "optional": false},
        {"category": "tent", "attributes": ["2-person", "lightweight"], "quantity": 1, "optional": true}
    ]

    sample_research_tasks_for_main = [{"task_type": "find_product_category", "category_info": cat} for cat in sample_goal_analyzer_output_categories]

    print("\n--- Testing Researcher with mock data generation ---")
    findings = researcher.conduct_research(sample_research_tasks_for_main)

    print("\n--- Mock Research Findings Output ---")
    import json
    print(json.dumps(findings, indent=2))

    # Example for a general research task if it were defined
    # general_task = [{"task_type": "research_general_info", "details": "best time to trek Manali"}]
    # general_findings = researcher.conduct_research(general_task)
    # print("\n--- Mock General Findings Output ---")
    # print(json.dumps(general_findings, indent=2))
