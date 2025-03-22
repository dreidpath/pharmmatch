// Your Firebase imports and config...

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ⬇️ START PASTING HERE
function App() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState('UK');
  const [listings, setListings] = useState([]);
  const [formData, setFormData] = useState({ type: 'offer', medicine: '', quantity: '' });

  useEffect(() => {
    onAuthStateChanged(auth, (u) => setUser(u));
    fetchListings();
  }, []);

  async function fetchListings() {
    const querySnapshot = await getDocs(collection(db, 'listings'));
    setListings(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  }

  async function handleLogin(email, password) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function handleRegister(email, password) {
    await createUserWithEmailAndPassword(auth, email, password);
  }

  async function handleLogout() {
    await signOut(auth);
  }

  async function addListing(e) {
    e.preventDefault();
    await addDoc(collection(db, 'listings'), { ...formData, user: user.email });
    fetchListings();
    setFormData({ type: 'offer', medicine: '', quantity: '' });
  }

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">PharmMatch</h1>

      <div className="mb-4">
        <label className="mr-2">Mode:</label>
        <select value={mode} onChange={(e) => setMode(e.target.value)} className="border p-1">
          <option value="UK">UK (Pharmacy)</option>
          <option value="Humanitarian">Humanitarian</option>
        </select>
      </div>

      {!user ? (
        <div>
          <button onClick={() => handleLogin('test@test.com', 'password')} className="bg-blue-500 text-white px-3 py-1 rounded mr-2">Login</button>
          <button onClick={() => handleRegister('test@test.com', 'password')} className="bg-green-500 text-white px-3 py-1 rounded">Register</button>
        </div>
      ) : (
        <div className="mb-4">
          <p className="mb-2">Logged in as {user.email}</p>
          <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-1 rounded">Logout</button>
        </div>
      )}

      {user && (
        <form onSubmit={addListing} className="mb-6">
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="border p-1 mr-2"
          >
            <option value="offer">I have</option>
            <option value="need">I need</option>
          </select>
          <input
            type="text"
            placeholder="Medicine"
            value={formData.medicine}
            onChange={(e) => setFormData({ ...formData, medicine: e.target.value })}
            className="border p-1 mr-2"
          />
          <input
            type="text"
            placeholder="Quantity"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            className="border p-1 mr-2"
          />
          <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">Post</button>
        </form>
      )}

      <h2 className="text-xl font-semibold mb-2">Listings</h2>
      <ul>
        {listings.map((item) => (
          <li key={item.id} className="border p-2 mb-2 rounded">
            <strong>{item.type === 'offer' ? '💊 Has' : '❗ Needs'}:</strong> {item.medicine} ({item.quantity})<br />
            <span className="text-sm text-gray-500">Posted by {item.user}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
