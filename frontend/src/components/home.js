import { PurpleBtn } from './buttons.js'

function Home() {
  const tools = [
    /*{
      to: '/image2code',
      text: 'Image 2 Code'
    },*/
    {
      to: '/generatecode',
      text: 'Generate Code'
    },
    {
      to: '/fixcode',
      text: 'Fix Error/Bug in a Code'
    },
  ];
  return (
    <>
      <div className="toolsLink flex flex-col align-middle justify-center gap-3 mt-10 mx-8">
        {tools.map((tool, index) => (
          <PurpleBtn key={index} tag='Link' text={tool.text} to={tool.to} />
        ))}
        <p className="text-white mt-4 text-sm text-center underline underline-offset-2">And many more soon...</p>
      </div>
    </>
  )
}

export default Home