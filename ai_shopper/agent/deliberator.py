# ai_shopper/agent/deliberator.py

class Deliberator:
    """
    Filters, compares, and selects the best product options based on research findings,
    user constraints (budget, sustainability preferences), and optimization goals.
    This is where the agent "thinks" and makes decisions.
    """

    def __init__(self):
        pass

    def select_best_options(self, research_findings: dict, constraints: list[dict]) -> dict:
        """
        Analyzes researched products against user constraints to select the optimal set of gear.

        Args:
            research_findings: Data collected by the Researcher.
                               Example: {"hiking_boots": [{"name": "Boot A", ...}, ...], ...}
            constraints: User-defined constraints from GoalAnalyzer.
                         Example: [
                             {"task_type": "filter_constraint", "criteria": "sustainability", "value": "preferred"},
                             {"task_type": "budget_constraint", "limit": 40000, "currency": "INR"}
                         ]

        Returns:
            A dictionary representing the proposed final cart or selection of items.
            Example:
            {
                "selected_items": [
                    {"category": "hiking_boots", "item": {"name": "Boot A", ...}},
                    {"category": "jacket", "item": {"name": "Jacket B", ...}}
                ],
                "total_price": 39500,
                "budget_adherence": True,
                "sustainability_notes": "Selected B-Corp certified boot and jacket with recycled materials."
            }
        """
        print(f"Deliberating with findings: {research_findings} and constraints: {constraints}")
        selected_cart = {"selected_items": [], "total_price": 0}

        # Extract key constraints
        budget_limit = float('inf')
        sustainability_preferred = False
        for constraint in constraints:
            if constraint.get("task_type") == "budget_constraint":
                budget_limit = constraint.get("limit", float('inf'))
            if constraint.get("task_type") == "filter_constraint" and constraint.get("criteria") == "sustainability":
                sustainability_preferred = (constraint.get("value") == "preferred")

        # Placeholder logic for deliberation:
        # 1. Iterate through product categories in research_findings.
        # 2. For each category, filter products based on sustainability if preferred.
        # 3. Select the "best" product (e.g., highest rated, best specs) within budget.
        # 4. This would involve more complex ranking and combinatorial optimization in a real scenario,
        #    potentially using an LLM for multi-criteria decision making.

        current_total_price = 0
        for category, products in research_findings.items():
            if not products:
                continue

            # Apply sustainability filter if preferred
            eligible_products = products
            if sustainability_preferred:
                eligible_products = [p for p in products if p.get("sustainability")] # Simple check
                if not eligible_products: # Fallback if no sustainable options found
                    eligible_products = products


            # Select best product (e.g., highest review, then lowest price if tied)
            # This is highly simplified.
            best_product_for_category = None
            if eligible_products:
                # Sort by review (desc), then price (asc)
                eligible_products.sort(key=lambda x: (-x.get("reviews_rating", 0), x.get("price", float('inf'))))

                for product in eligible_products:
                    product_price = product.get("price", float('inf'))
                    if current_total_price + product_price <= budget_limit:
                        best_product_for_category = product
                        break

            if best_product_for_category:
                selected_cart["selected_items"].append({
                    "category": category,
                    "item": best_product_for_category
                })
                current_total_price += best_product_for_category.get("price", 0)

        selected_cart["total_price"] = current_total_price
        selected_cart["budget_adherence"] = current_total_price <= budget_limit
        # Add more details like sustainability notes, etc.

        print(f"Selected cart: {selected_cart}")
        return selected_cart

if __name__ == '__main__':
    deliberator = Deliberator()
    sample_findings = {
        "hiking_boots": [
            {"name": "Boot A", "brand": "Brand X", "price": 15000, "sustainability": "B-Corp", "reviews_rating": 4.7},
            {"name": "Boot B", "brand": "Brand Y", "price": 12000, "sustainability": "Recycled materials", "reviews_rating": 4.5},
            {"name": "Boot C", "brand": "Brand Z", "price": 18000, "reviews_rating": 4.8} # Not sustainable
        ],
        "jacket": [
            {"name": "Jacket Alpha", "brand": "EcoWear", "price": 22000, "sustainability": "Organic Cotton", "reviews_rating": 4.6},
            {"name": "Jacket Beta", "brand": "TechGear", "price": 20000, "reviews_rating": 4.9} # Not sustainable
        ]
    }
    sample_constraints = [
        {"task_type": "budget_constraint", "limit": 40000, "currency": "INR"},
        {"task_type": "filter_constraint", "criteria": "sustainability", "value": "preferred"}
    ]

    final_selection = deliberator.select_best_options(sample_findings, sample_constraints)
    print("\nFinal Selection:")
    for key, value in final_selection.items():
        if key == "selected_items":
            print(f"  {key}:")
            for item_info in value:
                print(f"    - Category: {item_info['category']}, Item: {item_info['item']['name']}")
        else:
            print(f"  {key}: {value}")
