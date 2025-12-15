# LingoDrift Backend

This project uses [uv](https://github.com/astral-sh/uv) for dependency management and Python version control.

## Prerequisites
- **uv**: [Install uv](https://github.com/astral-sh/uv?tab=readme-ov-file#installation)
  ```bash
  curl -LsSf https://astral.sh/uv/install.sh | sh
  ```

## Setup
1. **Initialize Environment**:
   `uv` will automatically download the correct Python version (3.12) and create the virtual environment.
   ```bash
   uv sync
   ```

2. **Activate Virtual Environment**:
   ```bash
   source .venv/bin/activate
   ```

3. **Run Development Server**:
   ```bash
   uv run uvicorn main:app --reload
   ```

## Managing Dependencies
- **Add a package**: `uv add <package_name>`
- **Remove a package**: `uv remove <package_name>`
- **Update lockfile**: `uv lock`

## Database
We use **PostgreSQL** with the **Psycopg 3** driver (`psycopg`).
Ensure your `DATABASE_URL` starts with `postgresql+psycopg://`.
