import {
  CaretDownOutlined,
  CaretRightOutlined,
  DeleteOutlined,
  EditOutlined,
  FolderOpenOutlined,
  FolderOutlined
} from '@ant-design/icons';
import categoryService from '@app/services/categories';
import { Category } from '@app/types/category';
import { Button, Empty } from 'antd';
import { memo, useState } from 'react';
import './CategoryTree.css';

interface CategoryTreeProps {
  categories: Category[];
  onSelectCategory: (category: Category) => void;
  onDeleteCategory: (category: Category) => void;
  selectedCategoryId?: string;
  onDragEnd?: (result: any) => void; // Keep for compatibility, but we won't use it
}

interface CategoryTreeNodeProps {
  category: Category;
  onSelectCategory: (category: Category) => void;
  onDeleteCategory: (category: Category) => void;
  level: number;
  isSelected: boolean;
  categories: Category[]; 
  selectedCategoryId?: string;
  index: number;
}

// Use memo to optimize rendering performance
const CategoryTreeNode = memo(({ 
  category, 
  onSelectCategory, 
  onDeleteCategory, 
  level, 
  isSelected,
  categories,
  selectedCategoryId,
  index
}: CategoryTreeNodeProps) => {
  const [expanded, setExpanded] = useState(true);

  const children = category.children || [];
  const hasChildren = children.length > 0;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  const handleSelect = async () => {
    try {
      const detailedCategory = await categoryService.getCategory(category.id);
      onSelectCategory(detailedCategory);
    } catch (error) {
      console.error('Error fetching category details:', error);
    }
  };

  return (
    <div className="category-tree-node">
      <div 
        className={`category-tree-item ${isSelected ? 'selected' : ''}`}
        onClick={handleSelect}
      >
        <div className="toggle-icon" onClick={handleToggle}>
          {hasChildren ? (
            expanded ? <CaretDownOutlined style={{ color: '#888' }} /> : <CaretRightOutlined style={{ color: '#888' }} />
          ) : (
            <span style={{ width: '1rem', display: 'inline-block' }}></span>
          )}
        </div>
        
        <div className="category-icon">
          {expanded && hasChildren ? (
            <FolderOpenOutlined style={{ color: '#ffc107' }} />
          ) : (
            <FolderOutlined style={{ color: '#ffc107' }} />
          )}
        </div>
        
        <span className="category-name">{category.name}</span>
        
        <div className="category-actions">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleSelect();
            }}
            title="Edit"
            style={{ marginRight: 8 }}
          />
          
          <Button
            type="text"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              onDeleteCategory(category);
            }}
            title="Delete"
          />
        </div>
      </div>
      
      {expanded && hasChildren && (
        <div className="category-children">
          {children.map((child, childIndex) => (
            <CategoryTreeNode
              key={child.id}
              category={child}
              onSelectCategory={onSelectCategory}
              onDeleteCategory={onDeleteCategory}
              level={level + 1}
              isSelected={selectedCategoryId === child.id}
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              index={childIndex}
            />
          ))}
        </div>
      )}
    </div>
  );
});

// Avoid defaultProps warning by using explicit naming
CategoryTreeNode.displayName = 'CategoryTreeNode';

// Recursive function to flatten categories (keep it for possible future use)
const flattenCategories = (
  categories: Category[], 
  parentId: string | null = null, 
  level: number = 0,
  result: any[] = []
) => {
  if (!categories) return result;
  
  categories.forEach(category => {
    result.push({
      ...category,
      level,
      parentId
    });
    
    if (category.children && category.children.length > 0) {
      flattenCategories(category.children, category.id, level + 1, result);
    }
  });
  
  return result;
};

// Use memo for the main component as well
const CategoryTree = memo(({ 
  categories, 
  onSelectCategory, 
  onDeleteCategory,
  selectedCategoryId
}: CategoryTreeProps) => {
  return (
    <div className="category-tree-container">
      {categories && categories.length > 0 ? (
        categories.map((category, index) => (
          <CategoryTreeNode
            key={category.id}
            category={category}
            onSelectCategory={onSelectCategory}
            onDeleteCategory={onDeleteCategory}
            level={0}
            isSelected={selectedCategoryId === category.id}
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            index={index}
          />
        ))
      ) : (
        <Empty description="No categories found. Create your first category." />
      )}
    </div>
  );
});

// Avoid defaultProps warning by using explicit naming
CategoryTree.displayName = 'CategoryTree';

export default CategoryTree;