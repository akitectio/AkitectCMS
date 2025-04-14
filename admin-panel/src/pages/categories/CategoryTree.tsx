import { faCaretDown, faCaretRight, faEdit, faFolder, faFolderOpen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { Button } from 'react-bootstrap';
import { Category } from '../../types/category';
import './CategoryTree.css';

interface CategoryTreeProps {
  categories: Category[];
  onSelectCategory: (category: Category) => void;
  onDeleteCategory: (category: Category) => void;
  selectedCategoryId?: string;
}

interface CategoryTreeNodeProps {
  category: Category;
  onSelectCategory: (category: Category) => void;
  onDeleteCategory: (category: Category) => void;
  level: number;
  isSelected: boolean;
  categories: Category[]; // All categories for finding children
}

const CategoryTreeNode = ({ 
  category, 
  onSelectCategory, 
  onDeleteCategory, 
  level, 
  isSelected,
  categories
}: CategoryTreeNodeProps) => {
  const [expanded, setExpanded] = useState(true);
  
  // Find children based on parentId
  const children = categories.filter(c => 
    c.parent && c.parent.id === category.id
  );
  
  const hasChildren = children.length > 0;
  
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };
  
  return (
    <div className="category-tree-node">
      <div 
        className={`category-tree-item ${isSelected ? 'selected' : ''}`} 
        style={{ paddingLeft: `${level * 20}px` }}
        onClick={() => onSelectCategory(category)}
      >
        {hasChildren && (
          <span className="toggle-icon" onClick={handleToggle}>
            <FontAwesomeIcon icon={expanded ? faCaretDown : faCaretRight} />
          </span>
        )}
        
        <span className="category-icon">
          <FontAwesomeIcon icon={expanded ? faFolderOpen : faFolder} color="#ffc107" />
        </span>
        
        <span className="category-name">{category.name}</span>
        
        <div className="category-actions">
          <Button
            variant="outline-info"
            size="sm"
            className="btn-icon mr-1"
            onClick={(e) => {
              e.stopPropagation();
              onSelectCategory(category);
            }}
            title="Edit"
          >
            <FontAwesomeIcon icon={faEdit} />
          </Button>
          
          <Button
            variant="outline-danger"
            size="sm"
            className="btn-icon"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteCategory(category);
            }}
            title="Delete"
          >
            <FontAwesomeIcon icon={faTrash} />
          </Button>
        </div>
      </div>
      
      {expanded && hasChildren && (
        <div className="category-children">
          {children.map(child => (
            <CategoryTreeNode
              key={child.id}
              category={child}
              onSelectCategory={onSelectCategory}
              onDeleteCategory={onDeleteCategory}
              level={level + 1}
              isSelected={isSelected && category.id === child.id}
              categories={categories}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Function to build the tree structure
const buildCategoryTree = (categories: Category[]): Category[] => {
  // Make sure categories is an array before filtering
  if (!categories || !Array.isArray(categories)) {
    return [];
  }
  // Find top-level categories (those without parents)
  return categories.filter(category => !category.parent);
};

const CategoryTree = ({ 
  categories, 
  onSelectCategory, 
  onDeleteCategory,
  selectedCategoryId
}: CategoryTreeProps) => {
  // Get the root categories
  const rootCategories = buildCategoryTree(categories);
  
  return (
    <div className="category-tree">
      {rootCategories.length > 0 ? (
        rootCategories.map(category => (
          <CategoryTreeNode
            key={category.id}
            category={category}
            onSelectCategory={onSelectCategory}
            onDeleteCategory={onDeleteCategory}
            level={0}
            isSelected={selectedCategoryId === category.id}
            categories={categories}
          />
        ))
      ) : (
        <div className="text-center text-muted pt-4">
          No categories found. Create your first category.
        </div>
      )}
    </div>
  );
};

export default CategoryTree;