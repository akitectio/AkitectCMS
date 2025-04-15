import { CloseOutlined, MinusOutlined } from '@ant-design/icons';
import { ContentHeader } from '@components';
import { Button, Card, Space } from 'antd';

const SubMenu = () => {
  return (
    <div>
      <ContentHeader title="SubMenu Page" />
      <section style={{ padding: '20px 0' }}>
        <div style={{ maxWidth: '100%', margin: '0 auto' }}>
          <Card
            title="Title"
            extra={
              <Space>
                <Button 
                  type="text" 
                  icon={<MinusOutlined />} 
                  title="Collapse"
                />
                <Button 
                  type="text" 
                  icon={<CloseOutlined />} 
                  title="Remove"
                />
              </Space>
            }
            actions={[<div key="footer">Footer</div>]}
          >
            Start creating your amazing application!
          </Card>
        </div>
      </section>
    </div>
  );
};

export default SubMenu;
