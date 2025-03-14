
const Role = ({ isConnected, labelVoter }) => {
  return (
    <>
    {isConnected ? (
    <div className="header-connect-button">
       <div className="header-role-badge">
         Role: {labelVoter}
       </div>
    </div>
    ) : (
    <div className="flex justify-between items-center p-5">
        <label>
          Please connect to your account
        </label>
     </div>
    )}
  </>

  )
}

export default Role