import React from "react";
import { Form, InputGroup, Button } from "react-bootstrap";
import { X, Search } from "lucide-react";
import "@/styles/searchbar.css";

export default function SearchBar({ value, onChange }) {
  return (
    <div className="search-container">
      <InputGroup className="search-bar">
        <InputGroup.Text className="search-icon">
          <Search size={18} />
        </InputGroup.Text>

        <Form.Control
          type="search"
          placeholder="Rechercher un film..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />

        {value && (
          <Button
            variant="light"
            className="clear-btn"
            onClick={() => onChange("")}
          >
            <X size={16} />
          </Button>
        )}
      </InputGroup>
    </div>
  );
}