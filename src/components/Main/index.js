import styles from "./styles.module.css";
import TopNav from "../TopNavigation";
import Home from "../../pages/Home";

const Main = () => {
  return (
    <div className={styles.main_container}>
      <TopNav />
      <Home />
    </div>
  );
};

export default Main;
