import React from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCharacter } from "./character-detail.api";
import { Character } from "./character-detail.model";
import { characterDetailKeys } from "./key-queries";

export const CharacterDetailPage = () => {
  const { characterId } = useParams();

  const { data: character } = useQuery(
    [characterDetailKeys.characterDetail(characterId), characterId],
    () => getCharacter(characterId)
  );

  return (
    <>
      <h1>Character Page</h1>
      <Link to="/">Back to Character Collection</Link>
      {character && (
        <div>
          <h2>{character.name}</h2>
          <img src={character.image} alt={character.name} />
          <h4>{character.gender}</h4>
          <h4>{character.status}</h4>
          <h4>{character.type}</h4>
        </div>
      )}
    </>
  );
};
