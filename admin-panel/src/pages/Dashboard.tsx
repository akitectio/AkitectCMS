import {
  BellOutlined,
  BookOutlined,
  CalendarOutlined,
  FileOutlined,
  HistoryOutlined,
  LineChartOutlined,
  MailOutlined,
  PieChartOutlined,
  ShoppingCartOutlined,
  UserAddOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useAppSelector } from '@app/store/store';
import { Avatar, Button, Card, Col, Divider, List, Progress, Row, Statistic, Table, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

const { Title, Text } = Typography;

const StyledStatCard = styled(Card)`
  text-align: center;
  .ant-statistic-title {
    font-size: 16px;
  }
  .anticon {
    font-size: 36px;
    margin-bottom: 12px;
  }
`;

const IconWrapper = styled.div<{ $bgColor: string }>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: ${props => props.$bgColor};
  color: white;
  font-size: 20px;
`;

const Dashboard = () => {
  const { currentUser } = useAppSelector(state => state.auth);
  const [date, setDate] = useState(new Date());
  
  // Example data for recent activities
  const recentActivities = [
    { id: 1, activity: 'New user registered', time: '10 mins ago', icon: <UserAddOutlined />, color: '#52c41a' },
    { id: 2, activity: 'System updated', time: '1 hour ago', icon: <HistoryOutlined />, color: '#1890ff' },
    { id: 3, activity: 'New order #43242', time: '3 hours ago', icon: <ShoppingCartOutlined />, color: '#faad14' },
    { id: 4, activity: 'User John updated profile', time: '1 day ago', icon: <UserOutlined />, color: '#1890ff' }
  ];
  
  // Table data for services
  const servicesData = [
    {
      key: '1',
      service: 'Content Management',
      usage: 55,
      status: 'Active',
      color: '#ff4d4f'
    },
    {
      key: '2',
      service: 'User Management',
      usage: 70,
      status: 'Active',
      color: '#faad14'
    },
    {
      key: '3',
      service: 'Media Library',
      usage: 30,
      status: 'Active',
      color: '#1890ff'
    },
    {
      key: '4',
      service: 'Settings',
      usage: 90,
      status: 'Active',
      color: '#52c41a'
    }
  ];

  // Table columns for services
  const columns = [
    {
      title: 'Service',
      dataIndex: 'service',
      key: 'service',
    },
    {
      title: 'Usage',
      dataIndex: 'usage',
      key: 'usage',
      render: (usage: number, record: any) => (
        <Progress percent={usage} strokeColor={record.color} size="small" />
      )
    },
    {
      title: 'Percentage',
      key: 'percentage',
      render: (record: any) => (
        <Tag color={record.color}>{record.usage}%</Tag>
      )
    },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'status',
      render: (status: string) => (
        <Tag color="success">{status}</Tag>
      )
    },
  ];

  // Mock data for users
  const users = Array.from({ length: 8 }, (_, index) => ({
    id: index + 1,
    name: `User ${index + 1}`,
    avatar: '/img/default-profile.png',
    date: 'Today'
  }));

  // Update date every minute
  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ padding: '24px 0' }}>
      <Title level={2} style={{ marginBottom: '24px' }}>Dashboard</Title>

      {/* Welcome Section */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={24}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Title level={4} style={{ margin: 0 }}>Welcome, {currentUser?.name || 'Admin User'}!</Title>
                <Text type="secondary">
                  {date.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Text>
              </div>
              <Button type="primary" icon={<CalendarOutlined />}>
                View Schedule
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <StyledStatCard>
            <ShoppingCartOutlined style={{ color: '#1890ff' }} />
            <Statistic title="New Orders" value={150} />
            <Button type="link" style={{ padding: 0 }}>More info</Button>
          </StyledStatCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StyledStatCard>
            <LineChartOutlined style={{ color: '#52c41a' }} />
            <Statistic title="Bounce Rate" value={53} suffix="%" />
            <Button type="link" style={{ padding: 0 }}>More info</Button>
          </StyledStatCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StyledStatCard>
            <UserAddOutlined style={{ color: '#faad14' }} />
            <Statistic title="User Registrations" value={44} />
            <Button type="link" style={{ padding: 0 }}>More info</Button>
          </StyledStatCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StyledStatCard>
            <PieChartOutlined style={{ color: '#ff4d4f' }} />
            <Statistic title="Unique Visitors" value={65} />
            <Button type="link" style={{ padding: 0 }}>More info</Button>
          </StyledStatCard>
        </Col>
      </Row>

      {/* Main Dashboard Content */}
      <Row gutter={[16, 16]}>
        {/* Left column - Chart and Table */}
        <Col xs={24} lg={16}>
          <Card 
            title={
              <span>
                <LineChartOutlined style={{ marginRight: 8 }} />
                Site Analytics
              </span>
            }
            style={{ marginBottom: '16px' }}
          >
            <div style={{ height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#fafafa' }}>
              <Text type="secondary">Chart Placeholder - Analytics Data</Text>
            </div>
          </Card>

          {/* Most Used Services */}
          <Card 
            title={
              <span>
                <LineChartOutlined style={{ marginRight: 8 }} />
                Most Used Services
              </span>
            }
          >
            <Table 
              dataSource={servicesData} 
              columns={columns} 
              pagination={false} 
              size="middle"
            />
          </Card>
        </Col>

        {/* Right column - Activity Feed and Users */}
        <Col xs={24} lg={8}>
          {/* Recent Activities */}
          <Card 
            title={
              <span>
                <HistoryOutlined style={{ marginRight: 8 }} />
                Recent Activities
              </span>
            }
            style={{ marginBottom: '16px' }}
          >
            <List
              itemLayout="horizontal"
              dataSource={recentActivities}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<IconWrapper $bgColor={item.color}>{item.icon}</IconWrapper>}
                    title={<span>{item.activity} <Tag style={{ float: 'right' }}>{item.time}</Tag></span>}
                    description={`Activity ID: #${item.id}`}
                  />
                </List.Item>
              )}
            />
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Button type="link">View All Activities</Button>
            </div>
          </Card>

          {/* Latest Users */}
          <Card 
            title={
              <span>
                <UserOutlined style={{ marginRight: 8 }} />
                Latest Users
              </span>
            }
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
              {users.map(user => (
                <div key={user.id} style={{ textAlign: 'center', width: '70px' }}>
                  <Avatar 
                    src={user.avatar} 
                    size={60}
                    style={{ border: '2px solid #f0f0f0' }} 
                  />
                  <div>
                    <Button type="link" style={{ padding: '4px 0', height: 'auto' }}>{user.name}</Button>
                  </div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>{user.date}</Text>
                </div>
              ))}
            </div>
            <Divider style={{ margin: '16px 0' }} />
            <div style={{ textAlign: 'center' }}>
              <Button type="link">View All Users</Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Info Boxes Row */}
      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Row gutter={16} align="middle">
              <Col span={8}>
                <Avatar 
                  size={64} 
                  icon={<MailOutlined />} 
                  style={{ backgroundColor: '#1890ff' }} 
                />
              </Col>
              <Col span={16}>
                <Statistic title="Messages" value={1410} />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Row gutter={16} align="middle">
              <Col span={8}>
                <Avatar 
                  size={64} 
                  icon={<BookOutlined />} 
                  style={{ backgroundColor: '#52c41a' }} 
                />
              </Col>
              <Col span={16}>
                <Statistic title="Bookmarks" value={928} />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Row gutter={16} align="middle">
              <Col span={8}>
                <Avatar 
                  size={64} 
                  icon={<BellOutlined />} 
                  style={{ backgroundColor: '#faad14' }} 
                />
              </Col>
              <Col span={16}>
                <Statistic title="Notifications" value={257} />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Row gutter={16} align="middle">
              <Col span={8}>
                <Avatar 
                  size={64} 
                  icon={<FileOutlined />} 
                  style={{ backgroundColor: '#ff4d4f' }} 
                />
              </Col>
              <Col span={16}>
                <Statistic title="Reports" value={128} />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
