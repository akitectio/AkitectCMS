import dashboardApi from '@/api/dashboardApi';
import ContentHeader from '@/components/common/ContentHeader';
import StatsCard from '@/components/widgets/StatsCard';
import { DashboardStats } from '@/types';
import { Chart, registerables } from 'chart.js';
import React, { useEffect, useState } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { Bar, Line } from 'react-chartjs-2';
import { BsBook, BsCollectionFill, BsFileEarmarkText, BsPersonFill } from 'react-icons/bs';

// Đăng ký Chart.js components
Chart.register(...registerables);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    usersCount: 0,
    postsCount: 0,
    seriesCount: 0,
    lessonsCount: 0,
    recentVisits: [],
    contentByCategory: []
  });
  
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await dashboardApi.getStats();
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  const visitChartData = {
    labels: stats.recentVisits.map(item => item.date),
    datasets: [
      {
        label: 'Lượt truy cập',
        data: stats.recentVisits.map(item => item.count),
        fill: false,
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
        tension: 0.1
      }
    ]
  };

  const categoryChartData = {
    labels: stats.contentByCategory.map(item => item.category),
    datasets: [
      {
        label: 'Số lượng nội dung',
        data: stats.contentByCategory.map(item => item.count),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderWidth: 1
      }
    ]
  };
  
  return (
    <>
      <ContentHeader 
        title="Dashboard" 
        breadcrumb={[{ text: 'Dashboard' }]} 
      />
      
      {loading ? (
        <div className="text-center p-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          <Row className="mb-4">
            <Col md={3}>
              <StatsCard 
                title="Người dùng"
                value={stats.usersCount}
                icon={<BsPersonFill size={24} />}
                color="primary"
              />
            </Col>
            <Col md={3}>
              <StatsCard 
                title="Bài viết"
                value={stats.postsCount}
                icon={<BsFileEarmarkText size={24} />}
                color="info"
              />
            </Col>
            <Col md={3}>
              <StatsCard 
                title="Khóa học"
                value={stats.seriesCount}
                icon={<BsBook size={24} />}
                color="success"
              />
            </Col>
            <Col md={3}>
              <StatsCard 
                title="Bài học"
                value={stats.lessonsCount}
                icon={<BsCollectionFill size={24} />}
                color="warning"
              />
            </Col>
          </Row>
          
          <Row>
            <Col md={8}>
              <Card className="mb-4 shadow-sm">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Lượt truy cập trong 30 ngày qua</h5>
                </Card.Header>
                <Card.Body>
                  <Line data={visitChartData} options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                      tooltip: {
                        mode: 'index',
                        intersect: false,
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true
                      }
                    }
                  }} />
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="mb-4 shadow-sm">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Nội dung theo danh mục</h5>
                </Card.Header>
                <Card.Body>
                  <Bar data={categoryChartData} options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        display: false,
                      }
                    }
                  }} />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </>
  );
};

export default Dashboard;