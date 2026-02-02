import { LinearClient } from "@linear/sdk";

let client: LinearClient | null = null;

export function getLinearClient(): LinearClient {
  if (!client) {
    const apiKey = process.env.LINEAR_API_KEY;
    if (!apiKey) {
      throw new Error("LINEAR_API_KEY is not configured");
    }
    client = new LinearClient({ apiKey });
  }
  return client;
}

export async function getTeams() {
  const linearClient = getLinearClient();
  const teams = await linearClient.teams();
  return teams.nodes.map((team) => ({
    id: team.id,
    name: team.name,
    key: team.key,
  }));
}

export async function getProjects(teamId: string) {
  const linearClient = getLinearClient();
  const team = await linearClient.team(teamId);
  const projects = await team.projects();
  return projects.nodes.map((project) => ({
    id: project.id,
    name: project.name,
    teamId: teamId,
  }));
}

export async function getMilestones(projectId: string) {
  const linearClient = getLinearClient();
  const project = await linearClient.project(projectId);
  const milestones = await project.projectMilestones();
  return milestones.nodes.map((milestone) => ({
    id: milestone.id,
    name: milestone.name,
    projectId: projectId,
  }));
}
