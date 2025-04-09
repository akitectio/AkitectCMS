import React from 'react';
import { Card } from 'react-bootstrap';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color }) => {
  return (
    <Card className="stat-card h-100 border-0 shadow-sm">
      <Card.Body className="d-flex align-items-center">
        <div className={`icon-wrapper bg-${color} text-white me-3`}>
          {icon}
        </div>
        <div>
          <h3 className="mb-0">{value}</h3>
          <p className="text-muted mb-0">{title}</p>
        </div>
      </Card.Body>
    </Card>
  );
};

export default StatsCard;