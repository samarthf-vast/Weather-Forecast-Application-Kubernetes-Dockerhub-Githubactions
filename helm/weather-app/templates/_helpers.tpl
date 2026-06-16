{{- define "weather-app.namespace" -}}
{{ .Values.namespace }}
{{- end }}

{{- define "weather-app.labels" -}}
app.kubernetes.io/managed-by: Helm
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
