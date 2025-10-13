"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Calendar,
  Clock,
  Languages,
  Film,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AuthButton from "@/components/auth-button";
import Link from "next/link";
import MovieModal from "@/components/MovieModal";

export default function FavoritemoviesPage() {
  const [selectedMovie, setSelectedMovie] = useState(null);

  const router = useRouter();
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [subtitles, setSubtitles] = useState([]);
  const [formats, setformats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    format: "all",
    language: "all",
    subtitle: "all",
    genre: "all",
  });

  useEffect(() => {
    const fetchmovies = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/movies", {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch movies");
        }

        const movies = await response.json();

        setMovies(movies);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchmovies();
  }, [router]);

  const fetchGenres = async () => {
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/movies/genres", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch movies");
      }

      const genres = await response.json();

      setGenres(genres);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchformats = async () => {
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/movies/formats", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch movies");
      }

      const formats = await response.json();

      setformats(formats);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchLanguages = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/movies/languages",
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch movies");
      }

      const languages = await response.json();

      setLanguages(languages);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSubtitles = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/movies/subtitles",
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch movies");
      }

      const subtitles = await response.json();

      setSubtitles(subtitles);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGenres();
    fetchLanguages();
    fetchSubtitles();
    fetchformats();
  }, [router]);

  function getColorForGenre(genre) {
    const index =
      genre.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
      genreColors.length;
    const color = genreColors[index];
    return `${color.light} ${color.dark}`;
  }

  const genreColors = [
    { light: "text-gray-800", dark: "dark:text-gray-200" },
    { light: "text-purple-800", dark: "dark:text-purple-200" },
    { light: "text-blue-800", dark: "dark:text-blue-200" },
    { light: "text-green-800", dark: "dark:text-green-200" },
    { light: "text-red-800", dark: "dark:text-red-200" },
    { light: "text-orange-800", dark: "dark:text-orange-200" },
  ];

  if (loading) {
    return (
      <div className="h-200 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading movies...</span>
      </div>
    );
  }

  const filteredMovies = movies.filter((movie) => {
    return (
      (filters.genre === "all" || movie.genres.includes(filters.genre)) &&
      (filters.language === "all" ||
        movie.languages.includes(filters.language)) &&
      (filters.subtitle === "all" ||
        movie.subtitles?.includes(filters.subtitle)) &&
      (filters.format === "all" || movie.formats?.includes(filters.format))
    );
  });

  return (
    <div className="max-w-7xl m-auto px-4 py-10">
      <div className="flex justify-between items-center mt-2 mb-10">
        <h1 className="text-2xl font-bold">Movies</h1>
        <div className="flex items-center">
          <Link
            href="/"
            className="cursor-pointer flex items-center pr-4 border-r-2"
          >
            Home
          </Link>
          <Link
            href="/"
            className="cursor-pointer flex items-center pr-4 pl-4 border-r-2"
          >
            Theater plays
          </Link>
          <Link
            href="/"
            className="cursor-pointer flex items-center pl-4 pr-4 border-r-2"
          >
            Sponsorship
          </Link>
          <div className="pl-4 flex item-center">
            <AuthButton />
          </div>
        </div>
      </div>
      <div className="flex gap-20 mb-5">
        <Select
          value={filters.genre}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, genre: value }))
          }
        >
          <SelectTrigger className="w-full ring-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Genres</SelectItem>
            {genres.map((gen) => (
              <SelectItem key={gen.id} value={gen.name}>
                {gen.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.language}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, language: value }))
          }
        >
          <SelectTrigger className="w-full ring-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Languages</SelectItem>
            {languages.map((lan) => (
              <SelectItem key={lan.id} value={lan.name}>
                {lan.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.subtitle}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, subtitle: value }))
          }
        >
          <SelectTrigger className="w-full ring-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Subtitles</SelectItem>
            {subtitles.map((sub) => (
              <SelectItem key={sub.id} value={sub.name}>
                {sub.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.format}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, format: value }))
          }
        >
          <SelectTrigger className="w-full ring-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Formats</SelectItem>
            {formats.map((format) => (
              <SelectItem key={format.id} value={format.name}>
                {format.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {filteredMovies.length === 0 ? (
        <p className="text-muted-foreground">No favorite movies yet.</p>
      ) : (
        <div className="space-y-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMovies.map((movie) => {
            return (
              <Card
                key={movie.id}
                className="p-4 cursor-pointer"
                onClick={() => setSelectedMovie(movie)}
              >
                <img src={movie.img_url} alt="" />
                <h4 className="text-lg sm:text-xl pt-6 pb-4 font-semibold">
                  {movie.title}
                </h4>
                <div className="flex flex-wrap">
                  <Film className="mr-2" />
                  {movie.genres.map((gen, index) => (
                    <span
                      className={`text-sm font-medium ${getColorForGenre(gen)}`}
                      key={index}
                      style={{
                        marginRight:
                          index !== movie.genres.length - 1 ? "0.25rem" : "0",
                      }}
                    >
                      {gen}
                      {index !== movie.genres.length - 1 && ","}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap">
                  <Languages className="mr-2" />
                  {movie.languages.map((lan, index) => {
                    return (
                      <span className="text-sm" key={index}>
                        {lan} {index !== movie.languages.length - 1 && " "}
                      </span>
                    );
                  })}
                </div>
              </Card>
            );
          })}
          {selectedMovie && (
            <MovieModal
              movie={selectedMovie}
              onClose={() => setSelectedMovie(null)}
            />
          )}
        </div>
      )}
    </div>
  );
}
