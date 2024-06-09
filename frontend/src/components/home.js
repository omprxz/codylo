import {PurpleBtn} from './buttons.js'
import { Link } from 'react-router-dom';

function Home(){
  const tools = [
    {
      to: '/generatecode',
      text: 'Generate Code'
    }
    ];
  return(
    <>
    <div className="toolsLink flex flex-col align-middle justify-center mt-10 mx-8">
    { tools.map((tool, index) => (
      <PurpleBtn tag='Link' text={tool.text} to={tool.to} />
    ))
    }
    </div>
    </>
    )
}

export default Home