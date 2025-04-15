import { CloseOutlined, SearchOutlined } from '@ant-design/icons';
import { IMenuItem, MENU } from '@app/modules/main/menu-sidebar/MenuSidebar';
import type { MenuProps } from 'antd';
import { Dropdown, Empty, Input, List, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

const { Text } = Typography;

const SearchContainer = styled.div`
  width: 100%;
  position: relative;
`;

const StyledInput = styled(Input)`
  background-color: rgba(0, 0, 0, 0.1);
  border: none;
  border-radius: 4px;
  color: inherit;

  .ant-input {
    background-color: transparent;
    color: inherit;
  }

  .ant-input-suffix {
    color: inherit;
    opacity: 0.7;
    cursor: pointer;
  }
`;

const SearchResultsList = styled(List)`
  max-height: 300px;
  overflow-y: auto;
  
  .ant-list-item {
    padding: 8px 12px;
    cursor: pointer;
    transition: background-color 0.3s;
    
    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
  }
`;

const SearchPath = styled(Text)`
  font-size: 80%;
  color: #adb5bd;
`;

const StyledEmpty = styled(Empty)`
  padding: 16px;
  
  .ant-empty-description {
    color: #adb5bd;
  }
`;

export const SidebarSearch = () => {
  const [searchText, setSearchText] = useState('');
  const [foundMenuItems, setFoundMenuItems] = useState<IMenuItem[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    setFoundMenuItems([]);
    if (searchText) {
      setFoundMenuItems(findMenuItems(MENU));
      setDropdownOpen(true);
    } else {
      setSearchText('');
      setFoundMenuItems([]);
      setDropdownOpen(false);
    }
  }, [searchText]);

  const handleClearSearch = () => {
    setSearchText('');
    setDropdownOpen(false);
  };

  const handleMenuItemClick = () => {
    setSearchText('');
    setDropdownOpen(false);
  };

  const findMenuItems = (
    menuItems: IMenuItem[],
    results: IMenuItem[] = []
  ): IMenuItem[] => {
    for (const menuItem of menuItems) {
      if (menuItem.name.toLowerCase().includes(searchText.toLowerCase()) && menuItem.path) {
        results.push(menuItem);
      }
      if (menuItem.children) {
        findMenuItems(menuItem.children, results);
      }
    }
    return results;
  };

  // Highlight matching text
  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) {
      return <span>{text}</span>;
    }
    
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    
    return (
      <span>
        {parts.map((part, i) => 
          regex.test(part) ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
        )}
      </span>
    );
  };
  
  const dropdownItems = {
    items: foundMenuItems.map((item) => ({
      key: item.path as string,
      label: (
        <NavLink to={item.path as string} onClick={handleMenuItemClick}>
          <div>
            {highlightText(item.name, searchText)}
            <div>
              <SearchPath type="secondary">{item.path}</SearchPath>
            </div>
          </div>
        </NavLink>
      ),
    })),
  };

  return (
    <SearchContainer>
      <Dropdown
        menu={dropdownItems as MenuProps}
        open={dropdownOpen && foundMenuItems.length > 0}
        trigger={['click']}
        placement="bottomLeft"
        dropdownRender={(menu) => (
          <div style={{ backgroundColor: '#fff', boxShadow: '0 3px 6px rgba(0,0,0,0.16)' }}>
            {foundMenuItems.length > 0 ? (
              <SearchResultsList
                itemLayout="horizontal"
                dataSource={foundMenuItems}
                renderItem={(item) => (
                  <List.Item>
                    <NavLink 
                      to={item.path || '/'} 
                      onClick={handleMenuItemClick}
                      style={{ width: '100%' }}
                    >
                      <div style={{ fontWeight: 'bold' }}>
                        {highlightText(item.name, searchText)}
                      </div>
                      <SearchPath type="secondary">{item.path}</SearchPath>
                    </NavLink>
                  </List.Item>
                )}
              />
            ) : (
              <StyledEmpty description="No results found" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </div>
        )}
      >
        <StyledInput
          placeholder="Search..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          prefix={<SearchOutlined />}
          suffix={searchText && <CloseOutlined onClick={handleClearSearch} />}
        />
      </Dropdown>
    </SearchContainer>
  );
};
