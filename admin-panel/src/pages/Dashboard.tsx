import { InfoBox } from '@app/components/info-box/InfoBox';
import { useAppSelector } from '@app/store/store';
import { ContentHeader, SmallBox } from '@components';
import {
    faBookmark,
    faCalendarCheck,
    faCartShopping,
    faChartPie,
    faChartSimple,
    faClockRotateLeft,
    faEnvelope,
    faUser,
    faUserPlus,
    faUsers
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';

const Dashboard = () => {
  const { currentUser } = useAppSelector(state => state.auth);
  const [date, setDate] = useState(new Date());
  
  // Example data for recent activities
  const recentActivities = [
    { id: 1, activity: 'New user registered', time: '10 mins ago', icon: faUserPlus, color: 'success' },
    { id: 2, activity: 'System updated', time: '1 hour ago', icon: faClockRotateLeft, color: 'info' },
    { id: 3, activity: 'New order #43242', time: '3 hours ago', icon: faCartShopping, color: 'warning' },
    { id: 4, activity: 'User John updated profile', time: '1 day ago', icon: faUser, color: 'primary' }
  ];
  
  // Update date every minute
  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      <ContentHeader title="Dashboard" />

      <section className="content">
        <div className="container-fluid">
          {/* Welcome Section */}
          <div className="row mb-4">
            <div className="col-12">
              <Card>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h4 className="m-0">Welcome, {currentUser?.name || 'Admin User'}!</h4>
                      <p className="text-muted m-0">
                        {date.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                    <div>
                      <button className="btn btn-primary">
                        <FontAwesomeIcon icon={faCalendarCheck} className="mr-2" />
                        View Schedule
                      </button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </div>

          {/* Statistics Boxes */}
          <div className="row">
            <div className="col-lg-3 col-6">
              <SmallBox
                title="New Orders"
                text="150"
                navigateTo="#"
                variant="info"
                icon={{
                  content: (
                    <FontAwesomeIcon
                      icon={faCartShopping}
                      style={{ fontSize: '62px' }}
                    />
                  ),
                }}
              />
            </div>
            <div className="col-lg-3 col-6">
              <SmallBox
                title="Bounce Rate"
                text="53 %"
                navigateTo="#"
                variant="success"
                icon={{
                  content: (
                    <FontAwesomeIcon
                      icon={faChartSimple}
                      style={{ fontSize: '62px' }}
                    />
                  ),
                }}
              />
            </div>
            <div className="col-lg-3 col-6">
              <SmallBox
                title="User Registrations"
                text="44"
                navigateTo="#"
                variant="warning"
                icon={{
                  content: (
                    <FontAwesomeIcon
                      icon={faUserPlus}
                      style={{ fontSize: '62px' }}
                    />
                  ),
                }}
              />
            </div>
            <div className="col-lg-3 col-6">
              <SmallBox
                title="Unique Visitors"
                text="65"
                navigateTo="#"
                variant="danger"
                icon={{
                  content: (
                    <FontAwesomeIcon
                      icon={faChartPie}
                      style={{ fontSize: '62px' }}
                    />
                  ),
                }}
              />
            </div>
          </div>

          {/* Main Dashboard Content */}
          <div className="row">
            {/* Left column - Chart */}
            <div className="col-lg-8">
              <Card className="card-primary card-outline">
                <Card.Header>
                  <h3 className="card-title">
                    <i className="fas fa-chart-bar mr-1"></i>
                    Site Analytics
                  </h3>
                  <div className="card-tools">
                    <button type="button" className="btn btn-tool" data-card-widget="collapse">
                      <i className="fas fa-minus"></i>
                    </button>
                    <button type="button" className="btn btn-tool" data-card-widget="remove">
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </Card.Header>
                <Card.Body>
                  <div className="chart">
                    <div style={{height: '300px', width: '100%'}} className="d-flex justify-content-center align-items-center">
                      <h5 className="text-muted">Chart Placeholder - Analytics Data</h5>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              {/* Most Used Services */}
              <Card className="card-success card-outline">
                <Card.Header>
                  <h3 className="card-title">
                    <i className="fas fa-table mr-1"></i>
                    Most Used Services
                  </h3>
                </Card.Header>
                <Card.Body className="p-0">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Service</th>
                        <th>Usage</th>
                        <th>Status</th>
                        <th style={{ width: '40px' }}>Label</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Content Management</td>
                        <td>
                          <div className="progress progress-xs">
                            <div className="progress-bar progress-bar-danger" style={{ width: '55%' }}></div>
                          </div>
                        </td>
                        <td><span className="badge bg-danger">55%</span></td>
                        <td><span className="badge bg-success">Active</span></td>
                      </tr>
                      <tr>
                        <td>User Management</td>
                        <td>
                          <div className="progress progress-xs">
                            <div className="progress-bar bg-warning" style={{ width: '70%' }}></div>
                          </div>
                        </td>
                        <td><span className="badge bg-warning">70%</span></td>
                        <td><span className="badge bg-success">Active</span></td>
                      </tr>
                      <tr>
                        <td>Media Library</td>
                        <td>
                          <div className="progress progress-xs">
                            <div className="progress-bar bg-primary" style={{ width: '30%' }}></div>
                          </div>
                        </td>
                        <td><span className="badge bg-primary">30%</span></td>
                        <td><span className="badge bg-success">Active</span></td>
                      </tr>
                      <tr>
                        <td>Settings</td>
                        <td>
                          <div className="progress progress-xs">
                            <div className="progress-bar bg-success" style={{ width: '90%' }}></div>
                          </div>
                        </td>
                        <td><span className="badge bg-success">90%</span></td>
                        <td><span className="badge bg-success">Active</span></td>
                      </tr>
                    </tbody>
                  </table>
                </Card.Body>
              </Card>
            </div>

            {/* Right column - Feed */}
            <div className="col-lg-4">
              {/* Recent Activities */}
              <Card className="card-primary card-outline">
                <Card.Header>
                  <h3 className="card-title">
                    <i className="fas fa-history mr-1"></i>
                    Recent Activities
                  </h3>
                </Card.Header>
                <Card.Body className="p-0">
                  <ul className="products-list product-list-in-card pl-2 pr-2">
                    {recentActivities.map(activity => (
                      <li className="item" key={activity.id}>
                        <div className="product-img">
                          <div className={`bg-${activity.color} d-flex justify-content-center align-items-center`} style={{width: '50px', height: '50px', borderRadius: '50%'}}>
                            <FontAwesomeIcon icon={activity.icon} style={{fontSize: '20px', color: 'white'}} />
                          </div>
                        </div>
                        <div className="product-info">
                          <a href="#" className="product-title">
                            {activity.activity}
                            <span className="badge badge-warning float-right">{activity.time}</span>
                          </a>
                          <span className="product-description">
                            Activity ID: #{activity.id}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </Card.Body>
                <Card.Footer className="text-center">
                  <a href="#" className="uppercase">View All Activities</a>
                </Card.Footer>
              </Card>

              {/* Latest Users */}
              <Card className="card-info card-outline">
                <Card.Header>
                  <h3 className="card-title">
                    <FontAwesomeIcon icon={faUsers} className="mr-1" />
                    Latest Users
                  </h3>
                </Card.Header>
                <Card.Body className="p-0">
                  <ul className="users-list clearfix">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((user) => (
                      <li key={user} className="text-center">
                        <img 
                          src="/img/default-profile.png" 
                          alt="User Image" 
                          style={{width: '60px', height: '60px'}}
                          className="img-circle img-bordered-sm" 
                        />
                        <a className="users-list-name" href="#">User {user}</a>
                        <span className="users-list-date">Today</span>
                      </li>
                    ))}
                  </ul>
                </Card.Body>
                <Card.Footer className="text-center">
                  <a href="#" className="uppercase">View All Users</a>
                </Card.Footer>
              </Card>
            </div>
          </div>

          {/* Info Boxes */}
          <div className="row">
            <div className="col-lg-3 col-md-6 col-sm-12">
              <InfoBox
                title="Messages"
                text="1,410"
                icon={{
                  content: <FontAwesomeIcon icon={faEnvelope} />,
                  variant: 'info',
                }}
              />
            </div>
            <div className="col-lg-3 col-md-6 col-sm-12">
              <InfoBox
                variant="success"
                title="Bookmarks"
                text="928"
                icon={{ content: <FontAwesomeIcon icon={faBookmark} /> }}
              />
            </div>
            <div className="col-lg-3 col-md-6 col-sm-12">
              <InfoBox
                variant="warning"
                title="Notifications"
                text="257"
                icon={{ content: <FontAwesomeIcon icon={faEnvelope} /> }}
              />
            </div>
            <div className="col-lg-3 col-md-6 col-sm-12">
              <InfoBox
                variant="danger"
                title="Reports"
                text="128"
                icon={{ content: <FontAwesomeIcon icon={faBookmark} /> }}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
