// *****************************************************************************************************
// Descripción       : Gestor de plantillas para emails
// Creado por        : Enzo Gago Aguirre
// Fecha de Creación : 05/08/2025
// Acción a Realizar : Proporcionar funcionalidad para gestionar plantillas HTML
// *****************************************************************************************************

using System;
using System.Collections.Generic;
using System.IO;
using System.Text.RegularExpressions;
using saas_template.server.Config;
using Microsoft.AspNetCore.Hosting;

namespace saas_template.server.DataAccessObject.Helper
{
    /// <summary>
    /// Gestor de plantillas HTML para emails
    /// </summary>
    public class TemplateManager
    {
        private readonly Dictionary<string, string> _templates;
        private readonly string _templatePath;

        private readonly IWebHostEnvironment _hostingEnvironment;

        /// <summary>
        /// Constructor del TemplateManager
        /// </summary>
        /// <param name="appSettings">Configuración de la aplicación</param>
        /// <param name="hostingEnvironment">Entorno de hosting</param>
        public TemplateManager(AppSettings appSettings, IWebHostEnvironment hostingEnvironment)
        {
            _templates = new Dictionary<string, string>();
            _hostingEnvironment = hostingEnvironment;
            
            // Usar ContentRootPath para desarrollo, que apunta a la raíz del proyecto
            _templatePath = Path.Combine(_hostingEnvironment.ContentRootPath, "Templates", "Email");
            Console.WriteLine($"Ruta de plantillas: {_templatePath}");
            
            // Asegurarse que el directorio existe
            if (!Directory.Exists(_templatePath))
            {
                Directory.CreateDirectory(_templatePath);
            }
        }

        /// <summary>
        /// Verifica si una plantilla existe
        /// </summary>
        /// <param name="templateName">Nombre de la plantilla</param>
        /// <returns>True si existe, False en caso contrario</returns>
        public bool TemplateExists(string templateName)
        {
            Console.WriteLine(templateName);
            if (_templates.ContainsKey(templateName))
            {
                return true;
            }

            string templatePath = Path.Combine(_templatePath, $"{templateName}.html");
            Console.WriteLine(templatePath);
            return File.Exists(templatePath);
        }

        /// <summary>
        /// Obtiene una plantilla por su nombre
        /// </summary>
        /// <param name="templateName">Nombre de la plantilla</param>
        /// <returns>Contenido de la plantilla</returns>
        public string GetTemplate(string templateName)
        {
            // Si la plantilla ya está cargada en memoria, devolverla
            if (_templates.ContainsKey(templateName))
            {
                return _templates[templateName];
            }

            // Si no, intentar cargarla desde archivo
            string templatePath = Path.Combine(_templatePath, $"{templateName}.html");
            if (File.Exists(templatePath))
            {
                string template = File.ReadAllText(templatePath);
                _templates[templateName] = template; // Guardar en caché
                return template;
            }

            throw new FileNotFoundException($"La plantilla '{templateName}' no existe en {templatePath}");
        }

        /// <summary>
        /// Registra una nueva plantilla
        /// </summary>
        /// <param name="templateName">Nombre de la plantilla</param>
        /// <param name="templateContent">Contenido HTML de la plantilla</param>
        public void RegisterTemplate(string templateName, string templateContent)
        {
            _templates[templateName] = templateContent;
            
            // Guardar la plantilla en archivo
            string templatePath = Path.Combine(_templatePath, $"{templateName}.html");
            File.WriteAllText(templatePath, templateContent);
        }

        /// <summary>
        /// Procesa una plantilla reemplazando las variables
        /// </summary>
        /// <param name="templateName">Nombre de la plantilla</param>
        /// <param name="variables">Variables a reemplazar</param>
        /// <returns>HTML procesado</returns>
        public string ProcessTemplate(string templateName, Dictionary<string, string> variables)
        {
            string template = GetTemplate(templateName);
            return ProcessTemplateContent(template, variables);
        }

        /// <summary>
        /// Procesa el contenido de una plantilla reemplazando las variables
        /// </summary>
        /// <param name="templateContent">Contenido de la plantilla</param>
        /// <param name="variables">Variables a reemplazar</param>
        /// <returns>HTML procesado</returns>
        public string ProcessTemplateContent(string templateContent, Dictionary<string, string> variables)
        {
            var result = templateContent;
            
            // Reemplazar variables simples
            foreach (var variable in variables)
            {
                var placeholder = $"{{{{{variable.Key}}}}}";
                result = result.Replace(placeholder, variable.Value);
            }

            // Procesar condicionales
            result = ProcessConditionals(result, variables);

            return result;
        }

        /// <summary>
        /// Procesa condicionales en la plantilla
        /// </summary>
        /// <param name="template">Plantilla HTML</param>
        /// <param name="variables">Variables disponibles</param>
        /// <returns>HTML procesado</returns>
        private string ProcessConditionals(string template, Dictionary<string, string> variables)
        {
            // Patrón para detectar condicionales: {{#if VariableName}} Contenido {{/if}}
            var conditionalPattern = @"\{\{#if\s+([^}]+)\}\}(.*?)\{\{\/if\}\}";
            var result = template;

            // Buscar todos los condicionales
            var matches = Regex.Matches(template, conditionalPattern, RegexOptions.Singleline);
            foreach (Match match in matches)
            {
                var condition = match.Groups[1].Value.Trim();
                var content = match.Groups[2].Value;
                var fullMatch = match.Value;

                // Verificar si la condición se cumple
                bool conditionMet = false;
                if (variables.ContainsKey(condition))
                {
                    conditionMet = !string.IsNullOrEmpty(variables[condition]) && 
                                   !variables[condition].Equals("false", StringComparison.OrdinalIgnoreCase) &&
                                   !variables[condition].Equals("0");
                }

                // Reemplazar el condicional con su contenido o vacío según corresponda
                result = result.Replace(fullMatch, conditionMet ? content : string.Empty);
            }

            return result;
        }
    }
}
