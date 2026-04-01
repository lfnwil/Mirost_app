import Tags from './tags'

export default function Post() {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl shadow transition-transform duration-200 hover:scale-103 cursor-pointer bg-gray-100">
      <img src="https://i.pravatar.cc/30" alt="avatar" className="w-12 h-12 rounded-full object-cover flex"/>

      <div className="flex flex-col w-full gap-4">
        {/* Header */}
        <div className="flex">
          <h2 className="font-semibold">William Lafon</h2>
        </div>
        <Tags/>
        {/* Content */}
        <div className="flex">  
          <p>
            We are bootstrapping <span className="hover:underline text-blue-600">@konnect22</span> a social media
            to connect individuals with successful people to bring out the best in them.
          </p>
        </div>
      </div>
    </div>
  )
}