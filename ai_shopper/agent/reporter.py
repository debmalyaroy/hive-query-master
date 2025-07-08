# ai_shopper/agent/reporter.py

import json

class Reporter:
    """
    Generates a summarized report for the user based on the Deliberator's final selection.
    The report should be clear, concise, and provide justification for the choices made (conceptual for Phase C),
    along with a call to action (e.g., view cart, request alternatives).
    """

    def __init__(self):
        print("Reporter initialized.")

    def generate_report(self, final_selection: dict, original_prompt: str) -> str:
        """
        Creates a user-friendly report from the deliberated shopping cart.

        Args:
            final_selection: The output from the Deliberator.
                             Example: {"selected_items": [...], "total_price": ..., "currency": "INR", ...}
            original_prompt: The user's initial request, for context.

        Returns:
            A string containing the formatted report.
        """
        print(f"Reporter: Generating report for selection: {final_selection}")

        report_parts = []

        # Sanitize original prompt for display (optional, but good practice)
        display_prompt = original_prompt.replace('\n', ' ').strip()
        if len(display_prompt) > 75:
            display_prompt = display_prompt[:72] + "..."
        report_parts.append(f"Based on your request: \"{display_prompt}\"\n")

        total_price = final_selection.get("total_price", 0)
        budget_adherence = final_selection.get("budget_adherence", True) # Default to true if not specified
        currency = final_selection.get("currency", "INR")

        if budget_adherence:
            report_parts.append(f"I've assembled a gear list for you with a total estimated cost of {currency} {total_price:.2f}.")
        else:
            report_parts.append(f"I've assembled a gear list with a total estimated cost of {currency} {total_price:.2f}.")
            # We could add more detail if a budget was specified in constraints and it was exceeded.
            # This would require passing the original constraints.budget_total_INR to the reporter or having it in final_selection.

        selected_items = final_selection.get("selected_items", [])
        if not selected_items:
            report_parts.append("\nI could not find suitable items based on the current (mock) criteria and data.")
            report_parts.append("Please try refining your request or wait for real data integration!")
            return "\n".join(report_parts)

        report_parts.append("\nHere's what I recommend (using conceptual data for now):")
        for item_info in selected_items:
            category = item_info.get("category", "Unknown Category").replace('_', ' ').title()
            item = item_info.get("item", {}) # The 'item' is the product dictionary itself

            name = item.get("name", "Unknown Item")
            brand = item.get("brand", "")
            price = item.get("price", 0)
            item_currency = item.get("currency", currency) # Use item's currency if available, else report's currency
            rating = item.get("reviews_rating", "N/A")
            sustainability = item.get("sustainability_info", "")
            product_url = item.get("product_url", "")

            item_desc = f"\n- **{category}: {name}**"
            if brand:
                item_desc += f" by {brand}"
            item_desc += f"\n  Price: {item_currency} {price:.2f} | Rating: {rating}"
            if sustainability:
                item_desc += f"\n  Sustainability: {sustainability}"
            if product_url: # In a real app, this would be a clickable link
                item_desc += f"\n  More Info (mock link): {product_url}"

            report_parts.append(item_desc)

        overall_sustainability_notes = final_selection.get("sustainability_notes")
        if overall_sustainability_notes:
            report_parts.append(f"\n\nSustainability Focus: {overall_sustainability_notes}")

        report_parts.append("\n\nNext Steps (Conceptual):")
        report_parts.append("- [View Detailed Cart & Links]")
        report_parts.append("- [Request Alternatives for Specific Items]")
        report_parts.append("- [Refine Search Criteria]")

        # For debugging or more detailed view, you could append the raw selection
        # report_parts.append(f"\n\n--- Raw Selection Data ---\n{json.dumps(final_selection, indent=2)}")

        return "\n".join(report_parts)

if __name__ == '__main__':
    reporter = Reporter()

    # Sample output from the conceptual Deliberator
    sample_deliberator_output = {
        "selected_items": [
            {
                "category": "hiking_boots",
                "item": {"name": "Mock EcoBoot X", "brand": "EcoBrand", "price": 15000, "currency": "INR", "category": "hiking_boots", "attributes": ["terrain_suitable", "sustainable"], "sustainability_info": "Mocked as eco-friendly", "reviews_rating": 4.7, "product_url": "http://mock.com/ecoboot_x"}
            },
            {
                "category": "jacket",
                "item": {"name": "Mock GreenJacket", "brand": "EcoOutfitters", "price": 9500, "currency": "INR", "category": "jacket", "attributes": ["recycled_materials", "windproof"], "sustainability_info": "Made with recycled content (mock)", "reviews_rating": 4.8, "product_url": "http://mock.com/greenjacket"}
            }
        ],
        "total_price": 24500,
        "currency": "INR",
        "budget_adherence": True,
        "sustainability_notes": "Prioritized sustainable options for hiking_boots. Selected Mock EcoBoot X (hiking_boots) with eco-friendly focus. Prioritized sustainable options for jacket. Selected Mock GreenJacket (jacket) with eco-friendly focus."
    }

    original_query_for_test = "I need hiking boots and a jacket, budget 25000 INR, prefer sustainable."

    print("\n--- Test Report Generation ---")
    final_report_text = reporter.generate_report(sample_deliberator_output, original_query_for_test)
    print(final_report_text)

    print("\n--- Test Report with Empty Selection ---")
    empty_deliberator_output = {
        "selected_items": [],
        "total_price": 0,
        "currency": "INR",
        "budget_adherence": True, # Or False, depending on if a budget was set and not met
        "sustainability_notes": ""
    }
    empty_report_text = reporter.generate_report(empty_deliberator_output, "A request that found nothing.")
    print(empty_report_text)
