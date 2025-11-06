import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment, // <-- Baru: Untuk ikon di dalam textfield
  IconButton, // <-- Baru: Untuk tombol ikon
  Stack, // <-- Baru: Untuk tata letak form yang lebih baik
  Avatar, // <-- Baru: Untuk ikon di atas judul
  Alert, // <-- Baru: Untuk pesan error
  CircularProgress, // <-- Baru: Untuk indikator loading
  Link, // <-- Baru: Untuk link "Lupa Password"
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  LockOutlined, // <-- Baru: Ikon gembok
} from "@mui/icons-material";

export default function Login() {
  // --- State ---
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("siswa");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // State untuk pesan error

  // --- Handlers ---
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault(); // Mencegah fokus hilang saat diklik
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // Mulai loading
    setError(""); // Bersihkan error sebelumnya

    // Simulasi API call ke backend (ganti dengan fetch/axios ke FastAPI)
    console.log("Mengirim data:", { username, password, role });
    setTimeout(() => {
      // --- Logika validasi (CONTOH) ---
      // Ganti ini dengan respons asli dari backend Anda
      if (password === "password123") {
        // Jika sukses
        console.log("Login sukses!");
        // TODO: Redirect ke dashboard, simpan token, dll.
      } else {
        // Jika gagal
        setError("Username atau password yang Anda masukkan salah.");
      }
      // --- Akhir Logika ---

      setLoading(false); // Selesai loading
    }, 2000); // Simulasi delay jaringan 2 detik
  };

  // --- Render ---
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="#f5f5f5"
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          width: "100%", // Lebar responsif
          maxWidth: 400, // Lebar maksimum
          borderRadius: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center", // Pusatkan semua konten
        }}
      >
        {/* Ikon Gembok */}
        <Avatar sx={{ m: 1, bgcolor: "primary.main" }}>
          <LockOutlined />
        </Avatar>

        <Typography variant="h5" fontWeight="bold" textAlign="center">
          Login Aplikasi
        </Typography>
        <Typography variant="body1" textAlign="center" mb={3}>
          Absensi Vocab
        </Typography>

        {/* Tampilkan pesan error jika ada */}
        {error && (
          <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Ganti <form> dengan <Box component="form"> untuk integrasi sx prop */}
        <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
          {/* Gunakan Stack untuk spasi yang rapi antar elemen */}
          <Stack spacing={2}>
            <TextField
              label="Username"
              fullWidth
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading} // Nonaktifkan saat loading
            />

            <TextField
              label="Password"
              type={showPassword ? "text" : "password"} // Dinamis
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading} // Nonaktifkan saat loading
              InputProps={{
                // Tambahkan ikon show/hide password
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <FormControl fullWidth disabled={loading}>
              <InputLabel>Masuk sebagai</InputLabel>
              <Select
                value={role}
                label="Masuk sebagai"
                onChange={(e) => setRole(e.target.value)}
              >
                <MenuItem value="siswa">Siswa</MenuItem>
                <MenuItem value="guru">Guru</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              color="primary"
              fullWidth
              type="submit"
              disabled={loading} // Tombol nonaktif saat loading
              sx={{ mt: 2, py: 1.5, fontSize: "1rem" }} // Tombol sedikit lebih besar
            >
              {/* Tampilkan spinner atau teks */}
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Masuk"
              )}
            </Button>

            {/* Link Tambahan */}
            <Link
              href="#"
              variant="body2"
              textAlign="center"
              sx={{ mt: 1, display: "block" }}
              onClick={(e) => e.preventDefault()} // Ganti dgn navigasi
            >
              Lupa Password?
            </Link>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
