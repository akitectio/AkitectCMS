import { Button, Checkbox, Form, Input, Typography } from 'antd';
import { Link } from 'react-router-dom';

const { TextArea } = Input;
const { Text } = Typography;

const SettingsTab = ({ isActive }: { isActive: boolean }) => {
  return (
    <div style={{ display: isActive ? 'block' : 'none' }}>
      <Form layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
        <Form.Item label="Name" name="name">
          <Input placeholder="Name" />
        </Form.Item>
        
        <Form.Item label="Email" name="email">
          <Input type="email" placeholder="Email" />
        </Form.Item>
        
        <Form.Item label="Display Name" name="displayName">
          <Input placeholder="Display Name" />
        </Form.Item>
        
        <Form.Item label="Experience" name="experience">
          <TextArea placeholder="Experience" rows={4} />
        </Form.Item>
        
        <Form.Item label="Skills" name="skills">
          <Input placeholder="Skills" />
        </Form.Item>
        
        <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
          <Checkbox name="terms">
            <span>I agree to the </span>
            <Link to="/">terms and condition</Link>
          </Checkbox>
        </Form.Item>
        
        <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
          <Button type="primary" htmlType="submit">Submit</Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default SettingsTab;
