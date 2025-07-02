# ai_shopper/agent/reporter.py

class Reporter:
    """
    Generates a summarized report for the user based on the Deliberator's final selection.
    The report should be clear, concise, and provide justification for the choices made,
    along with a call to action (e.g., view cart, request alternatives).
    """

    def __init__(self):
        pass

    def generate_report(self, final_selection: dict, original_prompt: str) -> str:
        """
        Creates a user-friendly report from the deliberated shopping cart.

        Args:
            final_selection: The output from the Deliberator.
                             Example: {"selected_items": [...], "total_price": ..., ...}
            original_prompt: The user's initial request, for context.


        Returns:
            A string containing the formatted report.
            Example:
            "Report: I've assembled a full gear list for your trek under ₹39,500.
            I chose Brand A boots for their excellent ankle support, a Brand B jacket
            with a 20,000mm waterproof rating suitable for unpredictable weather,
            and a backpack from Brand C, which is a certified B-Corp.
            All items have 4.5+ star reviews. [View Cart] or [Request Alternatives]."
        """
        print(f"Generating report for selection: {final_selection}")

        report_parts = []
        report_parts.append(f"Report for your request: \"{original_prompt[:50]}...\"") # Show part of original prompt

        total_price = final_selection.get("total_price", 0)
        budget_adherence = final_selection.get("budget_adherence", False)
        currency = final_selection.get("currency", "INR") # Assume INR if not specified

        if budget_adherence:
            report_parts.append(f"I've assembled a gear list for you with a total cost of {currency}{total_price:.2f}.")
        else:
            report_parts.append(f"I've assembled a gear list with a total cost of {currency}{total_price:.2f}. This is over the specified budget if one was set.")

        selected_items = final_selection.get("selected_items", [])
        if not selected_items:
            report_parts.append("I could not find suitable items based on the criteria.")
            return "\n".join(report_parts)

        report_parts.append("\nHere's what I recommend:")
        for item_info in selected_items:
            category = item_info.get("category", "Unknown Category")
            item = item_info.get("item", {})
            name = item.get("name", "Unknown Item")
            brand = item.get("brand", "")
            price = item.get("price", 0)
            rating = item.get("reviews_rating", "N/A")
            sustainability = item.get("sustainability", "")

            item_desc = f"- **{category.replace('_', ' ').title()}**: {name}"
            if brand:
                item_desc += f" by {brand}"
            item_desc += f" (Price: {currency}{price:.2f}, Rating: {rating})"
            if sustainability:
                item_desc += f" [Sustainable: {sustainability}]"

            # Placeholder for more detailed justification based on specs or LLM reasoning
            # e.g., "chosen for its excellent ankle support and GORE-TEX waterproofing"
            report_parts.append(item_desc)

        # Add overall notes
        sustainability_notes = final_selection.get("sustainability_notes")
        if sustainability_notes:
            report_parts.append(f"\nSustainability Focus: {sustainability_notes}")

        # Call to action
        report_parts.append("\n[View Cart Link Placeholder] or [Request Alternatives Option Placeholder]")

        return "\n".join(report_parts)

if __name__ == '__main__':
    reporter = Reporter()
    sample_selection = {
        "selected_items": [
            {"category": "hiking_boots", "item": {"name": "Terra Pro Boot", "brand": "MountainPeak", "price": 15000, "reviews_rating": 4.7, "sustainability": "B-Corp Certified"}},
            {"category": "jacket", "item": {"name": "StormGuard Jacket", "brand": "NorthStar", "price": 22000, "reviews_rating": 4.6, "sustainability": "Recycled Materials", "specs": {"waterproof_rating": "20000mm"}}},
            {"category": "backpack", "item": {"name": "TrailBlazer 50L", "brand": "AdventureCo", "price": 10000, "reviews_rating": 4.8}}
        ],
        "total_price": 47000, # Example: over budget
        "budget_adherence": False, # Explicitly set for this example
        "currency": "INR",
        "sustainability_notes": "Prioritized items with sustainability certifications or made from recycled materials where possible."
    }
    original_query = "I'm going on a 5-day trek in the Himalayas near Manali next month. My budget is ₹40,000. I need all the essential gear. I prefer sustainable brands and I already have hiking socks. Get me the best options."

    final_report = reporter.generate_report(sample_selection, original_query)
    print("\n--- Generated Report ---")
    print(final_report)

    empty_selection = {"selected_items": [], "total_price": 0, "budget_adherence": True}
    final_report_empty = reporter.generate_report(empty_selection, original_query)
    print("\n--- Generated Report (Empty Selection) ---")
    print(final_report_empty)
