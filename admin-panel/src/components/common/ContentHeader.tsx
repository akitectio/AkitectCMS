import React from 'react';
import { Row, Col, Breadcrumb } from 'react-bootstrap';
import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  text: string;
  link?: string;
}

interface ContentHeaderProps {
  title: string;
  breadcrumb: BreadcrumbItem[];
}

const ContentHeader: React.FC<ContentHeaderProps> = ({ title, breadcrumb }) => {
  return (
    <div className="content-header mb-4">
      <Row className="align-items-center">
        <Col>
          <h1 className="m-0">{title}</h1>
          <Breadcrumb className="mt-2">
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/admin' }}>
              Dashboard
            </Breadcrumb.Item>
            {breadcrumb.map((item, index) => (
              <Breadcrumb.Item 
                key={index}
                active={index === breadcrumb.length - 1}
                linkAs={item.link ? Link : undefined}
                linkProps={item.link ? { to: item.link } : undefined}
              >
                {item.text}
              </Breadcrumb.Item>
            ))}
          </Breadcrumb>
        </Col>
      </Row>
    </div>
  );
};

export default ContentHeader;