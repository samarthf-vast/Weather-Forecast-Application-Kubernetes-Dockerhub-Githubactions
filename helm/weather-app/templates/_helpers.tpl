{{/*
Chart Name
*/}}
{{- define "weather-app.name" -}}
{{ .Chart.Name }}
{{- end }}

{{/*
Full Name
*/}}
{{- define "weather-app.fullname" -}}
{{ .Release.Name }}
{{- end }}

{{/*
Common Labels
*/}}
{{- define "weather-app.labels" -}}
app.kubernetes.io/name: {{ include "weather-app.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version }}
app.kubernetes.io/version: {{ .Chart.AppVersion }}
{{- end }}