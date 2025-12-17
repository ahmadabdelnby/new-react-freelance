import React, { useState, useEffect, useRef } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { API_ENDPOINTS } from '../../Services/config';
import './SearchableCountrySelect.css';

const SearchableCountrySelect = ({ value, onChange, name, required = false }) => {
    const [countries, setCountries] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [dropdownPosition, setDropdownPosition] = useState('bottom');
    const dropdownRef = useRef(null);

    // Fetch countries
    useEffect(() => {
        const fetchCountries = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(API_ENDPOINTS.COUNTRIES_ALL);

                if (response.ok) {
                    const data = await response.json();
                    setCountries(data);

                    // Set initial selected country if value exists
                    if (value) {
                        const country = data.find(c => c.name === value);
                        if (country) {
                            setSelectedCountry(country);
                            setSearchTerm(country.name);
                        } else {
                            // If value exists but not found in countries, still show it
                            setSearchTerm(value);
                        }
                    }
                } else {
                    setError('Failed to load countries');
                }
            } catch (error) {
                console.error('Failed to fetch countries:', error);
                setError('Failed to load countries');
            } finally {
                setLoading(false);
            }
        };
        fetchCountries();
    }, [value]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Filter countries based on search (show all if searchTerm is empty)
    const filteredCountries = searchTerm
        ? countries.filter(country => {
            const searchLower = searchTerm.toLowerCase();
            const nameLower = country.name.toLowerCase();
            const codeLower = country.code.toLowerCase();

            return nameLower.includes(searchLower) ||
                codeLower.includes(searchLower) || // "us" matches "US"
                searchLower.includes(codeLower); // "usa" contains "us"
        })
        : countries;

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setIsDropdownOpen(true);
    };

    const handleCountrySelect = (country) => {
        setSelectedCountry(country);
        setSearchTerm(country.name);
        setIsDropdownOpen(false);

        // Call onChange with the country name
        if (onChange) {
            onChange({ target: { name, value: country.name } });
        }
    };

    const handleInputFocus = () => {
        // Clear search term when focusing to show all countries
        setSearchTerm('');
        setIsDropdownOpen(true);

        // Calculate dropdown position
        setTimeout(() => {
            if (dropdownRef.current) {
                const rect = dropdownRef.current.getBoundingClientRect();
                const spaceBelow = window.innerHeight - rect.bottom;
                const spaceAbove = rect.top;

                // If less than 320px space below and more space above, open upward
                if (spaceBelow < 320 && spaceAbove > spaceBelow) {
                    setDropdownPosition('top');
                } else {
                    setDropdownPosition('bottom');
                }
            }
        }, 0);
    };

    const handleInputBlur = () => {
        // Restore selected country name if user didn't select anything
        setTimeout(() => {
            if (selectedCountry && !isDropdownOpen) {
                setSearchTerm(selectedCountry.name);
            }
        }, 200);
    };

    return (
        <div className="searchable-country-select" ref={dropdownRef}>
            <div className="country-input-wrapper">
                <input
                    type="text"
                    name={name}
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    placeholder={loading ? "Loading countries..." : selectedCountry ? selectedCountry.name : "Search for a country..."}
                    className="country-search-input"
                    required={required}
                    autoComplete="off"
                    disabled={loading}
                />
                <FaChevronDown
                    className={`country-dropdown-icon ${isDropdownOpen ? 'open' : ''}`}
                    onClick={() => !loading && setIsDropdownOpen(!isDropdownOpen)}
                />
            </div>

            {error && (
                <div className="country-error">
                    {error}
                </div>
            )}

            {isDropdownOpen && !loading && filteredCountries.length > 0 && (
                <div className={`country-dropdown ${dropdownPosition === 'top' ? 'dropdown-top' : 'dropdown-bottom'}`}>
                    {filteredCountries.map((country) => (
                        <div
                            key={country._id}
                            className="country-dropdown-item"
                            onClick={() => handleCountrySelect(country)}
                        >
                            <span className="country-flag">{country.flag}</span>
                            <span className="country-name">{country.name}</span>
                        </div>
                    ))}
                </div>
            )}

            {isDropdownOpen && !loading && searchTerm && filteredCountries.length === 0 && (
                <div className="country-dropdown">
                    <div className="country-dropdown-empty">No countries found</div>
                </div>
            )}
        </div>
    );
};

export default SearchableCountrySelect;
