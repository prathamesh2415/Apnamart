import { Link } from "react-router-dom";
import { categoryPhoto } from "../lib/catalogVisuals";
import type { Category } from "../types";

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <div className="cat-grid">
      {categories.map((category) => (
        <Link className="cat-tile photo" key={category.id} to={`/search?categoryId=${category.id}`}>
          <img src={categoryPhoto(category.name)} alt="" referrerPolicy="no-referrer" />
          <span>
            <strong>{category.name}</strong>
            <span className="muted">View products</span>
          </span>
        </Link>
      ))}
    </div>
  );
}
