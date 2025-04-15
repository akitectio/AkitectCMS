import { HomeOutlined } from '@ant-design/icons';
import { Breadcrumb, Col, Row, Typography } from 'antd';
import { Link } from 'react-router-dom';

const { Title } = Typography;

const ContentHeader = ({ title }: { title: string }) => {
  return (
    <div style={{ marginBottom: '24px' }}>
      <Row justify="space-between" align="middle">
        <Col xs={24} sm={12}>
          <Title level={2}>{title}</Title>
        </Col>
        <Col xs={24} sm={12} style={{ textAlign: 'right' }}>
          <Breadcrumb items={[
            {
              title: (
                <Link to="/">
                  <HomeOutlined /> Home
                </Link>
              ),
            },
            {
              title: title,
            },
          ]} />
        </Col>
      </Row>
    </div>
  );
};

export default ContentHeader;
