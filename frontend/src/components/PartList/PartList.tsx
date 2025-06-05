import React, { useEffect, useState, useCallback } from "react";
import {
    deletePart,
    fetchParts,
    purchasePart,
    FetchPartsParams,
    PaginatedPartsResponse
} from "../../services"; // Upewnij się, że ścieżka jest poprawna
import { Part, User } from "../../types"; // Upewnij się, że ścieżka i typy są poprawne
import { getRole } from "../../services"; // Upewnij się, że ścieżka jest poprawna
import styles from '../styles/PartsList.module.css';

interface PartsListProps {
    partsUpdateTrigger: number;
    onEditPart: (part: Part) => void;
}

const ITEMS_PER_PAGE = 10; // Domyślna liczba elementów na stronie

export const PartsList: React.FC<PartsListProps> = ({ partsUpdateTrigger, onEditPart }) => {
    // Inicjalizuj partsData z domyślną strukturą, aby uniknąć null w renderowaniu
    const initialPartsData: PaginatedPartsResponse = {
        items: [],
        totalItems: 0,
        totalPages: 0,
        currentPage: 1,
        itemsPerPage: ITEMS_PER_PAGE,
    };
    const [partsData, setPartsData] = useState<PaginatedPartsResponse>(initialPartsData);
    const [loading, setLoading] = useState(true); // Początkowo ładujemy dane
    const [error, setError] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<User['role'] | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock'>('name');
    const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');
    const [limit, setLimit] = useState(ITEMS_PER_PAGE);

    useEffect(() => {
        setUserRole(getRole());
    }, []);

    const loadParts = useCallback(async () => {
        setLoading(true);
        setError(null);
        const params: FetchPartsParams = {
            page: currentPage,
            limit: limit,
            search: searchTerm === "" ? undefined : searchTerm,
            sortBy: sortBy,
            sortOrder: sortOrder,
        };
        try {
            const data = await fetchParts(params);
            setPartsData(data);
        } catch (err: any) {
            console.error("Błąd w komponencie PartsList podczas ładowania części:", err);
            setError(err.message || "Nie udało się załadować listy części.");
            setPartsData(initialPartsData); // W razie błędu, ustaw dane na początkowy, pusty stan
        } finally {
            setLoading(false);
        }
    }, [currentPage, limit, searchTerm, sortBy, sortOrder]); // `initialPartsData` nie musi tu być, bo jest stałe

    useEffect(() => {
        loadParts();
    }, [loadParts, partsUpdateTrigger]);

    const handleDelete = async (partId: number) => {
        if (window.confirm("Czy na pewno chcesz usunąć tę część?")) {
            try {
                await deletePart(partId);
                loadParts(); // Odśwież listę
            } catch (err: any) {
                alert(err.message || "Nie udało się usunąć części.");
            }
        }
    };

    const handlePurchase = async (partId: number) => {
        try {
            await purchasePart(partId, 1); // Zakup 1 sztuki
            alert("Część została pomyślnie zakupiona!");
            loadParts(); // Odśwież listę
        } catch (err: any) {
            alert(err.message || "Nie udało się zakupić części.");
        }
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1);
    };

    const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        if (value === "price_asc") {
            setSortBy("price"); setSortOrder("ASC");
        } else if (value === "price_desc") {
            setSortBy("price"); setSortOrder("DESC");
        } else if (value === "name_asc") { // Załóżmy domyślne sortowanie po nazwie ASC
            setSortBy("name"); setSortOrder("ASC");
        }
        // Możesz dodać więcej opcji sortowania, np. po 'stock'
        setCurrentPage(1);
    };

    const handleLimitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setLimit(Number(event.target.value));
        setCurrentPage(1);
    };

    const handlePageChange = (newPage: number) => {
        // Sprawdzenie, czy partsData.totalPages jest dostępne i > 0
        if (newPage >= 1 && (partsData.totalPages > 0 ? newPage <= partsData.totalPages : true)) {
            setCurrentPage(newPage);
        }
    };

    // Wyświetlanie stanu ładowania lub błędu
    if (loading && partsData.items.length === 0) { // Pokaż spinner tylko przy pierwszym ładowaniu pustej listy
        return <div className="loading-spinner">Ładowanie danych...</div>; // Dodaj klasę CSS dla spinnera
    }

    if (error) {
        return <p className={`${styles.errorText} error-message`}>Błąd: {error}</p>;
    }

    return (
        <div className={styles.partsListContainer}>
            <h2 className={styles.listTitle}>Dostępne Części</h2>

            <div className={styles.controlsContainer}>
                <input
                    type="text"
                    placeholder="Szukaj części..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className={`${styles.searchInput} input-field`}
                />
                <div className={styles.sortAndLimit}>
                    <select onChange={handleSortChange} value={`${sortBy}_${sortOrder.toLowerCase()}`} className={`${styles.selectInput} input-field`}>
                        <option value="name_asc">Sortuj: Nazwa A-Z</option>
                        <option value="price_asc">Sortuj: Cena Rosnąco</option>
                        <option value="price_desc">Sortuj: Cena Malejąco</option>
                        {/* <option value="stock_asc">Sortuj: Stan Rosnąco</option> */}
                        {/* <option value="stock_desc">Sortuj: Stan Malejąco</option> */}
                    </select>
                    <select onChange={handleLimitChange} value={limit} className={`${styles.selectInput} input-field`}>
                        <option value={5}>Pokaż: 5</option>
                        <option value={10}>Pokaż: 10</option>
                        <option value={20}>Pokaż: 20</option>
                    </select>
                </div>
            </div>

            {loading && <p>Odświeżanie listy...</p>} {/* Wskaźnik ładowania, gdy dane są odświeżane w tle */}

            {partsData.items.length === 0 && !loading && (
                <p className={styles.noPartsMessage}>Brak części spełniających kryteria.</p>
            )}

            {partsData.items.length > 0 && (
                <>
                    <div className={styles.partsGrid}>
                        {partsData.items.map((part) => (
                            <div key={part.id} className={styles.partCard}>
                                <h3 className={styles.partName}>{part.name}</h3>
                                <p className={styles.partDescription}>{part.description || "Brak opisu."}</p>
                                <div className={styles.partDetails}>
                                    <p className={styles.partPrice}>
                                        Cena: <span>
                                            {typeof part.price === 'number'
                                                ? part.price.toFixed(2)
                                                : 'N/A'} PLN
                                        </span>
                                    </p>
                                    <p className={part.stock > 0 ? styles.partStockAvailable : styles.partStockUnavailable}>
                                        Dostępność: <span>{part.stock > 0 ? `${part.stock} szt.` : "Niedostępna"}</span>
                                    </p>
                                </div>
                                <div className={styles.cardActions}>
                                    {(userRole === "client" || userRole === "admin") && part.stock > 0 && (
                                        <button onClick={() => handlePurchase(part.id)} className="button-secondary">Kup</button>
                                    )}
                                    {userRole === "admin" && (
                                        <>
                                            <button onClick={() => onEditPart(part)} className={`${styles.actionButton} ${styles.editButton}`}>Edytuj</button>
                                            <button onClick={() => handleDelete(part.id)} className={`${styles.actionButton} button-danger`}>Usuń</button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {(partsData.totalPages > 0 && partsData.totalPages > 1) && ( // Pokaż paginację tylko jeśli jest więcej niż 1 strona
                        <div className={styles.paginationContainer}>
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1 || loading}
                                className="button-primary"
                            >
                                Poprzednia
                            </button>
                            <span>
                                Strona {currentPage} z {partsData.totalPages} (Łącznie: {partsData.totalItems})
                            </span>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === partsData.totalPages || loading}
                                className="button-primary"
                            >
                                Następna
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};