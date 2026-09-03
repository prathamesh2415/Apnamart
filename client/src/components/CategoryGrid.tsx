import { Link } from "react-router-dom";
import type { Category } from "../types";
import { categoryIcon } from "./Icons";

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <div className="cat-grid">
      {categories.map((category) => {
        const Icon = categoryIcon(category.name);
        return (
          <Link className="cat-tile" key={category.id} to={`/search?categoryId=${category.id}`}>
            <span className="cat-icon">
              <Icon size={22} />
            </span>
            <span>
              <strong>{category.name}</strong>
              <span className="muted">Browse suppliers</span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
