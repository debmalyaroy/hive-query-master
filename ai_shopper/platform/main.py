# ai_shopper/platform/main.py

import os
from flask import Flask, render_template, request, jsonify

# Import actual agent components
from ai_shopper.agent.goal_analyzer import GoalAnalyzer
from ai_shopper.agent.researcher import Researcher
from ai_shopper.agent.deliberator import Deliberator
from ai_shopper.agent.reporter import Reporter

app = Flask(__name__)

# Initialize actual agent components
# Note: GoalAnalyzer will try to load OPENAI_API_KEY from .env upon instantiation
goal_analyzer_agent = GoalAnalyzer()
researcher_agent = Researcher() # Will use mock logic for now
deliberator_agent = Deliberator() # Will use mock logic for now
reporter_agent = Reporter() # Will use mock logic for now

@app.route('/')
def index():
    """Serves the main page with the input form."""
    # Ensure the templates directory is correctly referenced if main.py is run directly
    # For Flask, templates are typically in a 'templates' folder at the same level as the app file,
    # or specified via template_folder argument in Flask constructor.
    # Our current structure `ai_shopper/platform/templates/index.html` with `main.py` in `platform/`
    # means Flask should find `templates/index.html` relative to `platform/`
    return render_template('index.html')

@app.route('/process_shopping_goal', methods=['POST'])
def process_shopping_goal():
    """
    Receives the user's shopping goal, processes it through the agent pipeline,
    and returns the generated report.
    """
    try:
        data = request.get_json()
        user_goal = data.get('goal')

        if not user_goal:
            return jsonify({"error": "No goal provided"}), 400

        # --- Agent Pipeline ---
        # 1. Decompose Goal
        app.logger.info(f"Received goal: {user_goal}. Starting GoalAnalyzer...")
        decomposed_output = goal_analyzer_agent.decompose_goal(user_goal)
        app.logger.info(f"GoalAnalyzer output: {decomposed_output}")

        if decomposed_output.get("error"):
            app.logger.error(f"GoalAnalyzer error: {decomposed_output['error']}")
            return jsonify({"error": f"Goal Analysis Failed: {decomposed_output['error']}"}), 500

        # Extract relevant parts for the next steps
        # Based on the structure defined in GoalAnalyzer's system prompt
        product_categories_to_find = decomposed_output.get("product_categories_to_find", [])
        # search_queries = decomposed_output.get("search_queries", []) # May not be directly used by mock researcher
        constraints = decomposed_output.get("constraints", {})

        # 2. Conduct Research (using conceptual/mock Researcher for this phase)
        app.logger.info(f"Starting Researcher with categories: {product_categories_to_find}")
        # The researcher's `conduct_research` needs to be adapted to take structured input
        # For now, let's assume it takes product_categories_to_find
        research_tasks_for_researcher = [{"task_type": "find_product_category", "category_info": cat} for cat in product_categories_to_find]
        research_findings = researcher_agent.conduct_research(research_tasks_for_researcher)
        app.logger.info(f"Researcher output: {research_findings}")

        # 3. Deliberate and Select Options (using conceptual/mock Deliberator)
        app.logger.info(f"Starting Deliberator with findings and constraints: {constraints}")
        # The deliberator's `select_best_options` needs research_findings and constraints
        # The constraints from GoalAnalyzer might need to be transformed or directly used
        final_selection = deliberator_agent.select_best_options(research_findings, [constraints] if constraints else []) # Pass constraints as a list
        app.logger.info(f"Deliberator output: {final_selection}")

        # 4. Generate Report
        app.logger.info("Starting Reporter...")
        report_text = reporter_agent.generate_report(final_selection, user_goal)
        app.logger.info(f"Reporter output: {report_text}")

        return jsonify({"report": report_text})

    except Exception as e:
        app.logger.error(f"Unhandled error in /process_shopping_goal: {e}", exc_info=True)
        return jsonify({"error": "An critical internal server error occurred."}), 500

if __name__ == '__main__':
    # This check for templates/index.html is good for local dev if file is missing.
    # In a containerized/deployed env, file should be present.
    template_dir = os.path.join(os.path.dirname(__file__), 'templates')
    index_html_path = os.path.join(template_dir, 'index.html')

    if not os.path.exists(index_html_path):
        os.makedirs(template_dir, exist_ok=True)
        # A very minimal index.html if it's missing, just to allow app to run.
        # The one from `create_file_with_block` in previous steps is more complete.
        with open(index_html_path, 'w') as f:
            f.write("<h1>AI Shopper (Minimal Fallback)</h1><p>If you see this, the main index.html was missing.</p>")
        app.logger.warning(f"Created minimal fallback index.html at {index_html_path}")

    app.run(debug=True, port=5001)
