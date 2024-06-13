import {PurpleBtn} from './buttons.js'

function Home(){
  const tools = [
    {
      to: '/generatecode',
      text: 'Generate Code'
    },
    {
      to: '/fixcode',
      text: 'Fix Error/Bug in a Code'
    },
    ];
  return(
    <>
    <div className="toolsLink flex flex-col align-middle justify-center gap-3 mt-10 mx-8">
    { tools.map((tool, index) => (
      <PurpleBtn tag='Link' text={tool.text} to={tool.to} />
    ))
    }
    </div>
    </>
    )
}

export default Home