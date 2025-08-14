import React from 'react';

const HomePage = () => {
  const handleClientAdminLogin = () => {
    window.location.href = '/client-admin/request-login/';
  };

  const handleStakeholderLogin = () => {
    window.location.href = '/stakeholder/request-login/';
  };

  const cardStyle = {
    background: 'white',
    border: '2px solid #e9ecef',
    borderRadius: '12px',
    padding: '30px 20px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginBottom: '20px'
  };

  const cardHoverStyle = {
    borderColor: '#026770',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(2, 103, 112, 0.1)'
  };

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: '#f8f9fa',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#333'
    }}>
      <div style={{
        maxWidth: '600px',
        width: '100%',
        padding: '20px',
        textAlign: 'center'
      }}>
        {/* Logo Section */}
        <div style={{ marginBottom: '50px' }}>
          {/* <div style={{
            width: '50px',
            height: '50px',
            background: '#026770',
            borderRadius: '8px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            color: 'white',
            fontSize: '24px',
            fontWeight: 'bold'
          }}>
            T
          </div> */}
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '600',
            color: '#026770',
            marginBottom: '10px',
            margin: '0 0 10px 0'
          }}>
            Terramo
          </h1>
          <p style={{
            fontSize: '1.1rem',
            color: '#666',
            marginBottom: '40px'
          }}>
            Welcome to Terramo
          </p>
        </div>

        {/* User Options */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '20px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {/* Client Admin Card */}
          <div 
            style={cardStyle}
            onClick={handleClientAdminLogin}
            onMouseEnter={(e) => {
              Object.assign(e.target.style, cardHoverStyle);
            }}
            onMouseLeave={(e) => {
              Object.assign(e.target.style, cardStyle);
            }}
          >
            <h3 style={{
              fontSize: '1.2rem',
              fontWeight: '600',
              color: '#026770',
              marginBottom: '8px',
              margin: '0 0 8px 0'
            }}>
              Client Admin
            </h3>
            <p style={{
              color: '#666',
              fontSize: '0.95rem',
              lineHeight: '1.4',
              margin: '0'
            }}>
              Login to access administrative features and manage client accounts
            </p>
          </div>

          {/* Stakeholder Card */}
          <div 
            style={cardStyle}
            onClick={handleStakeholderLogin}
            onMouseEnter={(e) => {
              Object.assign(e.target.style, cardHoverStyle);
            }}
            onMouseLeave={(e) => {
              Object.assign(e.target.style, cardStyle);
            }}
          >
            <h3 style={{
              fontSize: '1.2rem',
              fontWeight: '600',
              color: '#026770',
              marginBottom: '8px',
              margin: '0 0 8px 0'
            }}>
              Stakeholder
            </h3>
            <p style={{
              color: '#666',
              fontSize: '0.95rem',
              lineHeight: '1.4',
              margin: '0'
            }}>
              Login to access stakeholder resources and collaborate on projects
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '50px',
          color: '#999',
          fontSize: '0.85rem'
        }}>
          <p>© 2025 Terramo</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;