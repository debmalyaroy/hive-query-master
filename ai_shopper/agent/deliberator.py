# ai_shopper/agent/deliberator.py

import json

class Deliberator:
    """
    Filters, compares, and selects product options based on research findings and user constraints.
    For Phase C, this implements very basic filtering and selection logic using MOCK data.
    """

    def __init__(self):
        print("Deliberator initialized (using mock/conceptual logic for Phase C).")

    def select_best_options(self, research_findings: dict, constraints_list: list[dict]) -> dict:
        """
        Analyzes researched (mock) products against user constraints to select a conceptual set of gear.

        Args:
            research_findings: Data collected by the Researcher (mock for Phase C).
                               Example: {"hiking_boots": [{"name": "Mock Boot A", ...}, ...], ...}
            constraints_list: A list containing the single constraints object from GoalAnalyzer.
                              Example: `[{"budget_total_INR": 40000, "preferences": ["sustainable brands"], ...}]`
                              (Passed as a list from main.py for consistency with older structure, take first element)

        Returns:
            A dictionary representing the proposed final cart or selection of items.
        """
        print(f"Deliberator: Processing with findings: {research_findings} and constraints_list: {constraints_list}")

        # Extract the single constraints object if the list is not empty
        constraints = constraints_list[0] if constraints_list and isinstance(constraints_list, list) else {}

        budget_total_inr = constraints.get("budget_total_INR")
        preferences = constraints.get("preferences", [])
        # exclusions = constraints.get("exclusions", []) # Not used in this mock logic

        sustainability_preferred = any("sustainable" in pref.lower() for pref in preferences)

        selected_items_for_cart = []
        current_total_price = 0
        sustainability_notes_list = []

        # Iterate through categories found by the researcher
        for category, products in research_findings.items():
            if not products:
                continue

            eligible_products = products

            # Mock sustainability filter
            if sustainability_preferred:
                sustainable_options = [p for p in eligible_products if "eco-friendly" in p.get("sustainability_info", "").lower() or "recycled" in p.get("sustainability_info", "").lower()]
                if sustainable_options:
                    eligible_products = sustainable_options
                    sustainability_notes_list.append(f"Prioritized sustainable options for {category}.")
                else:
                    sustainability_notes_list.append(f"No clear sustainable mock options found for {category}, considering standard.")


            # Simple selection: pick the first product that fits the budget (if any)
            # This is extremely naive and for placeholder purposes only.
            best_product_for_category = None
            if eligible_products:
                # Sort by mock rating (desc) then price (asc) as a tie-breaker
                eligible_products.sort(key=lambda p: (-p.get("reviews_rating", 0), p.get("price", float('inf'))))

                for product in eligible_products:
                    product_price = product.get("price", float('inf'))
                    if budget_total_inr is None or (current_total_price + product_price <= budget_total_inr):
                        best_product_for_category = product
                        break # Pick the first one that fits

            if best_product_for_category:
                selected_items_for_cart.append({
                    "category": category,
                    "item": best_product_for_category # The whole product dict
                })
                current_total_price += best_product_for_category.get("price", 0)
                if "eco-friendly" in best_product_for_category.get("sustainability_info","").lower():
                     sustainability_notes_list.append(f"Selected {best_product_for_category['name']} ({category}) with eco-friendly focus.")


        final_selection = {
            "selected_items": selected_items_for_cart,
            "total_price": current_total_price,
            "currency": "INR", # Assuming INR
            "budget_adherence": budget_total_inr is None or current_total_price <= budget_total_inr,
            "sustainability_notes": " ".join(list(set(sustainability_notes_list))) # Unique notes
        }

        print(f"Deliberator: Final mock selection: {final_selection}")
        return final_selection

if __name__ == '__main__':
    deliberator = Deliberator()

    # Mock research findings (as if from Researcher.conduct_research)
    sample_mock_findings = {
        "hiking_boots": [
            {"name": "Mock EcoBoot X", "brand": "EcoBrand", "price": 15000, "currency": "INR", "category": "hiking_boots", "attributes": ["terrain_suitable", "sustainable"], "sustainability_info": "Mocked as eco-friendly", "reviews_rating": 4.7, "product_url": "http://mock.com/ecoboot_x"},
            {"name": "Mock AllTerrain Boot", "brand": "SolidGear", "price": 12000, "currency": "INR", "category": "hiking_boots", "attributes": ["all_weather"], "sustainability_info": "Standard materials", "reviews_rating": 4.5, "product_url": "http://mock.com/allterrain_boot"}
        ],
        "jacket": [
            {"name": "Mock WeatherShell Jacket", "brand": "TechFabric", "price": 8000, "currency": "INR", "category": "jacket", "attributes": ["waterproof"], "sustainability_info": "Standard materials", "reviews_rating": 4.2, "product_url": "http://mock.com/weathershell"},
            {"name": "Mock GreenJacket", "brand": "EcoOutfitters", "price": 9500, "currency": "INR", "category": "jacket", "attributes": ["recycled_materials", "windproof"], "sustainability_info": "Made with recycled content (mock)", "reviews_rating": 4.8, "product_url": "http://mock.com/greenjacket"}
        ],
        "backpack": [
             {"name": "Mock LargePack", "brand": "CarryMore", "price": 20000, "currency": "INR", "category": "backpack", "attributes": ["70L"], "sustainability_info": "Durable standard", "reviews_rating": 4.1, "product_url": "http://mock.com/largepack"}
        ]
    }

    # Mock constraints object (as if from GoalAnalyzer.decompose_goal)
    sample_constraints_from_goal_analyzer = {
        "budget_total_INR": 25000, # Test budget
        "preferences": ["sustainable brands", "lightweight"],
        "exclusions": ["color red"]
    }

    print("\n--- Test 1: With budget and sustainability preference ---")
    selection1 = deliberator.select_best_options(sample_mock_findings, [sample_constraints_from_goal_analyzer])
    print(json.dumps(selection1, indent=2))

    sample_constraints_no_budget = {
        "preferences": [],
        "exclusions": []
    }
    print("\n--- Test 2: No budget, no specific sustainability preference ---")
    selection2 = deliberator.select_best_options(sample_mock_findings, [sample_constraints_no_budget])
    print(json.dumps(selection2, indent=2))

    sample_constraints_tight_budget = {
        "budget_total_INR": 10000,
        "preferences": ["sustainable brands"],
    }
    print("\n--- Test 3: Tight budget with sustainability preference ---")
    selection3 = deliberator.select_best_options(sample_mock_findings, [sample_constraints_tight_budget])
    print(json.dumps(selection3, indent=2))
