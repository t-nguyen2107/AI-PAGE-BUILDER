import os
 plan_path = os.path.join(os.path.expanduser("~"), ".claude", "plans", "hashed-juggling-owl-agent-afc5bd4975595603b.md") content = open(plan_path, "w", encoding="utf-8", newline="\n") as f:    f.write(content)
 print(f"Written {len(content)} chars to {plan_path}")
