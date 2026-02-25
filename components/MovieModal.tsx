import { X } from "lucide-react";

export default function MovieModal({
  movie,
  onClose,
}: {
  movie: any;
  onClose: any;
}) {
  if (!movie) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg max-w-3xl w-full relative shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-white cursor-pointer"
        >
          <X size={24} />
        </button>
        <div className="flex">
          {/* {movie.trailer_url && (
            <div className="mb-4">
              <iframe
                width="100%"
                height="315"
                src={movie.trailer_url}
                title={movie.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded"
              ></iframe>
            </div>
          )} */}

          {/* <div className="mb-4">
            <iframe
              width="100%"
              height="315"
              src="https://youtu.be/69ffwl-8pCU?si=d2WlP1H2NX7wQv0m"
              title={movie.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="rounded"
            ></iframe>
          </div> */}

          <div className="html5-video-container" data-layer="0">
            <video
              tabIndex={-1}
              aria-hidden="true"
              className="video-stream html5-main-video"
              webkit-playsinline=""
              playsInline={false}
              controlsList="nodownload"
              src="blob:https://www.youtube.com/26c5bd93-d1c2-4bcc-b9b5-dbd990a7fe33"
            ></video>
          </div>

          <div className="ml-5">
            <h2 className="text-2xl font-bold mb-4">{movie.title}</h2>

            <p className="text-sm mb-4">
              {/* movie.description */}
              Lorem ipsum dolor sit, amet consectetur adipisicing elit. Dolore,
              fugiat necessitatibus! Illo nostrum laborum iste recusandae vitae
              dicta fugit sapiente voluptatum totam. Repellat, est neque.
              Adipisci vitae modi sequi autem!
            </p>

            <button className="w-full bg-primary text-primary-foreground rounded-md pb-5 pt-5">
              Buy tickets
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
