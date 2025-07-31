"use client"

const CollectionModal = ({ isOpen, onClose, onSelectCollection, collections }) => {
  if (!isOpen) return null

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          padding: "24px",
          maxWidth: "500px",
          width: "90%",
          maxHeight: "80vh",
          overflow: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "20px",
              fontWeight: "600",
              color: "#202223",
            }}
          >
            Select Collection
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "#637381",
            }}
          >
            ×
          </button>
        </div>

        <p
          style={{
            margin: "0 0 20px 0",
            color: "#637381",
            fontSize: "14px",
          }}
        >
          Choose a collection to create a product slider
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {collections.map((collection) => (
            <div
              key={collection.id}
              onClick={() => onSelectCollection(collection)}
              style={{
                padding: "16px",
                border: "1px solid #e1e3e5",
                borderRadius: "6px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                backgroundColor: "#ffffff",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#f8f9fa"
                e.target.style.borderColor = "#0066cc"
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "#ffffff"
                e.target.style.borderColor = "#e1e3e5"
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: "16px",
                    fontWeight: "500",
                    color: "#202223",
                  }}
                >
                  {collection.name}
                </h3>
                <span
                  style={{
                    backgroundColor: "#e3f2fd",
                    color: "#1976d2",
                    padding: "4px 8px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "500",
                  }}
                >
                  {collection.productCount} products
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CollectionModal
