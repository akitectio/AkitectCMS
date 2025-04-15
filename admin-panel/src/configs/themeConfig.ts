import { ThemeConfig } from 'antd';

/**
 * Global Ant Design theme configuration
 * This ensures consistent styling across the entire application
 */
const themeConfig: ThemeConfig = {
  token: {
    colorPrimary: '#007bff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1890ff',
    borderRadius: 4,
    wireframe: false,
  },
  components: {
    Layout: {
      siderBg: '#343a40',
      headerBg: '#ffffff',
      headerPadding: '0 24px',
      footerPadding: '24px 50px',
      lightBodyBg: '#f4f6f9',
    },
    Menu: {
      darkItemBg: '#343a40',
      darkItemColor: '#ffffff',
      darkItemHoverColor: '#ffffff',
      darkItemSelectedBg: '#007bff',
      darkSubMenuItemBg: '#2c3136',
    },
    Card: {
      colorBorderSecondary: '#f0f0f0',
    },
    Table: {
      headerBg: '#fafafa',
    },
    Button: {
      defaultBg: '#ffffff',
    }
  }
};

export default themeConfig;