from __future__ import annotations

from db import init_db, seed_benchmarks


def main() -> None:
    init_db()
    seed_benchmarks()
    print("SQLite database initialized.")


if __name__ == "__main__":
    main()
