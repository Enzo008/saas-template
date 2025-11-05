// *****************************************************************************************************
// Descripción       : Helper para manejo seguro de contraseñas
// Creado por        : Enzo Gago Aguirre
// Fecha de Creación : 22/07/2025
// Acción a Realizar : Proporcionar métodos para el manejo seguro de contraseñas
// *****************************************************************************************************

namespace saas_template.server.DataAccessObject.Helper
{
    /// <summary>
    /// Helper para el manejo seguro de contraseñas utilizando BCrypt
    /// </summary>
    public static class PasswordHelper
    {
        /// <summary>
        /// Encripta una contraseña utilizando BCrypt
        /// </summary>
        /// <param name="password">Contraseña en texto plano</param>
        /// <param name="workFactor">Factor de trabajo para BCrypt (default: 12)</param>
        /// <returns>Contraseña encriptada</returns>
        public static string HashPassword(string password, int workFactor = 12)
        {
            return BCrypt.Net.BCrypt.HashPassword(password, workFactor);
        }

        /// <summary>
        /// Verifica si una contraseña coincide con un hash
        /// </summary>
        /// <param name="password">Contraseña en texto plano</param>
        /// <param name="hash">Hash almacenado</param>
        /// <returns>True si la contraseña coincide con el hash</returns>
        public static bool VerifyPassword(string password, string hash)
        {
            return BCrypt.Net.BCrypt.Verify(password, hash);
        }

        /// <summary>
        /// Genera una contraseña aleatoria segura
        /// </summary>
        /// <param name="length">Longitud de la contraseña</param>
        /// <returns>Contraseña aleatoria</returns>
        public static string GenerateRandomPassword(int length = 12)
        {
            // Incluir al menos un carácter de cada categoría para asegurar complejidad
            const string lowerChars = "abcdefghijklmnopqrstuvwxyz";
            const string upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            const string numberChars = "0123456789";
            const string specialChars = "!@#$%^&*()_-+=";
            
            var random = new Random();
            var password = new char[length];
            
            // Asegurar al menos un carácter de cada tipo
            password[0] = lowerChars[random.Next(lowerChars.Length)];
            password[1] = upperChars[random.Next(upperChars.Length)];
            password[2] = numberChars[random.Next(numberChars.Length)];
            password[3] = specialChars[random.Next(specialChars.Length)];
            
            // Llenar el resto con caracteres aleatorios de todas las categorías
            var allChars = lowerChars + upperChars + numberChars + specialChars;
            for (int i = 4; i < length; i++)
            {
                password[i] = allChars[random.Next(allChars.Length)];
            }
            
            // Mezclar los caracteres para que no siempre sigan el mismo patrón
            for (int i = 0; i < length; i++)
            {
                int swapIndex = random.Next(length);
                (password[i], password[swapIndex]) = (password[swapIndex], password[i]);
            }
            
            return new string(password);
        }
        
        /// <summary>
        /// Verifica si una contraseña cumple con los requisitos mínimos de seguridad
        /// </summary>
        /// <param name="password">Contraseña a verificar</param>
        /// <param name="minLength">Longitud mínima (default: 8)</param>
        /// <returns>True si la contraseña cumple con los requisitos</returns>
        public static bool IsPasswordSecure(string password, int minLength = 8)
        {
            // Simplemente verificamos que la contraseña tenga la longitud mínima
            return !string.IsNullOrEmpty(password) && password.Length >= minLength;
        }
    }
}