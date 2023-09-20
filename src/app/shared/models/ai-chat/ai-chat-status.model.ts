export enum AiChatComponentStatus {
	Operational = 'operational',
	DegradedPerformance = 'degraded_performance', // yellow
	PartialOutage = 'partial_outage', // orange
	MajorOutage = 'major_outage', // red
}

enum AiChatIncidentStatus {

}

export enum AiChatStatusIndicator {
	None = 'none',
	Minor = 'minor', // yellow
	Major = 'major', // orange
	Critical = 'critical', // red
}


export type ClientOpenaiStatus = {
	title: string,
	message: string,
	link: string,
	indicator: AiChatStatusIndicator,
}

export type AiChatStatus = {
  components: Component[];
  incidents: Incident[];
  scheduled_maintenances: any[];
	status: {
		indicator: AiChatStatusIndicator;
		description: string;
	};
}

type Component = {
  name: string;
  status: AiChatComponentStatus;
  created_at: string;
  updated_at: string;
}

type Incident = {
  name: string;
  AiChatIncidentStatus: string;
  created_at: string;
  updated_at: string;
  monitoring_at: string;
  resolved_at: string;
	impact: AiChatStatusIndicator;
  shortlink: string;
  started_at: string;
  incident_updates: IncidentUpdate[];
  components: IncidentComponent[];
}

type IncidentUpdate = {
  status: AiChatIncidentStatus;
  body: string;
  created_at: string;
  updated_at: string;
  display_at: string;
  affected_components: AffectedComponent[];
}

type AffectedComponent = {
  name: string;
  new_status: AiChatComponentStatus;
}

type IncidentComponent = {
  name: string;
  status: AiChatComponentStatus;
}
