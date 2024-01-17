import { Menu } from "antd";
import { HomeOutlined, ExclamationCircleOutlined,  } from "@ant-design/icons";

const MenuList = () => {
  return (
    <Menu theme="dark">
      <Menu.Item key="home" icon={<HomeOutlined />}>
        בית
      </Menu.Item>
      <Menu.Item key="about" icon={<ExclamationCircleOutlined />}>
        אודות
      </Menu.Item>
      <Menu.Item key="home" icon={<HomeOutlined />}>
        לוח זמנים
      </Menu.Item>
      <Menu.Item key="home" icon={<HomeOutlined />}>
        נסיעות
      </Menu.Item>
      <Menu.Item key="home" icon={<HomeOutlined />}>
        מפה בזמן אמת
      </Menu.Item>
      <Menu.Item key="home" icon={<HomeOutlined />}>
        מפה לפי קו
      </Menu.Item>
      <Menu.Item key="home" icon={<HomeOutlined />}>
        דווח על באג
      </Menu.Item>
      <Menu.Item key="home" icon={<HomeOutlined />}>
        תרומות
      </Menu.Item>
      <Menu.Item key="home" icon={<HomeOutlined />}>
        ???
      </Menu.Item>
    </Menu>
  );
};

export default MenuList;
