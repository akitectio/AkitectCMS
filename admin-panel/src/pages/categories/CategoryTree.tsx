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
  selectedCategoryId?: string;
}

const CategoryTreeNode = ({ 
  category, 
  onSelectCategory, 
  onDeleteCategory, 
  level, 
  isSelected,
  categories,
  selectedCategoryId
}: CategoryTreeNodeProps) => {
  const [expanded, setExpanded] = useState(true);
  
  // Find children - check both direct children array and parent relationship
  const children = category.children && Array.isArray(category.children) && category.children.length > 0 
    ? category.children // Use children array if available
    : categories.filter(c => c.parent && c.parent.id === category.id); // Fallback to parent relationship
  
  const hasChildren = children && children.length > 0;
  
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };
  
  return (
    <div className="category-tree-node">
      <div 
        className={`category-tree-item ${isSelected ? 'selected' : ''}`}
        onClick={() => onSelectCategory(category)}
      >
        <div className="toggle-icon" onClick={handleToggle}>
          {hasChildren ? (
            <FontAwesomeIcon 
              icon={expanded ? faCaretDown : faCaretRight} 
              color="#888" 
              size="sm" 
            />
          ) : (
            <span style={{ width: '1rem', display: 'inline-block' }}></span>
          )}
        </div>
        
        <div className="category-icon">
          <FontAwesomeIcon 
            icon={expanded && hasChildren ? faFolderOpen : faFolder} 
            color="#ffc107"
          />
        </div>
        
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
              isSelected={selectedCategoryId === child.id}
              categories={categories}
              selectedCategoryId={selectedCategoryId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Function to build the tree structure with improved handling of parent-child relationships
const buildCategoryTree = (categories: Category[]): Category[] => {
  // Make sure categories is an array before filtering
  if (!categories || !Array.isArray(categories)) {
    return [];
  }
  
  // First check if we already have a proper tree structure with children arrays
  const hasChildrenArrays = categories.some(cat => cat.children && cat.children.length > 0);
  
  if (hasChildrenArrays) {
    // If children arrays are already populated, just return top-level categories
    return categories.filter(category => !category.parent);
  } else {
    // Otherwise, build parent-child relationships based on parent references
    // Find top-level categories (those without parents)
    return categories.filter(category => !category.parent);
  }
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
            selectedCategoryId={selectedCategoryId}
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