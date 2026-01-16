//Following list of current issue on this blog site
Rewriting entire database structure for better implementation of blogsite use for test users with the implementation of the following

username
comments
like counts

Failed to compile.
TS2339: Property 'author_avatar' does not exist on type 'Blog'.
    78 |                   <div className="flex items-start gap-3 mb-4">
    79 |                     <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0">
  > 80 |                       {blog.author_avatar ? (
       |                             ^^^^^^^^^^^^^
    81 |                         <img
    82 |                           src={blog.author_avatar}
    83 |                           alt={blog.author_username || 'User'}
Error: Command "npm run build" exited with 1