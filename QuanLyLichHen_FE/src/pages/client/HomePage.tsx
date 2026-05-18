import Product from '../../components/ui/Product';
import Datlich from '../../components/ui/DatLich';
import Slideshow from '../../components/ui/Slideshow';

const HomePage = () => {
  return (
    <div id="container">
      <Slideshow />
      <div className="clear"></div>
    
      
      <Datlich />
      <div className="clear"></div>
      
      <Product />
    </div>
  );
};

export default HomePage;