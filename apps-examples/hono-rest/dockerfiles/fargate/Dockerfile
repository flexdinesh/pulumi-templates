# ----- base -----
FROM node:20-alpine as base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# ----- build -----
FROM base AS build
COPY . /app
WORKDIR /app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# 1. build dependencies for all workspaces
RUN pnpm run clean
RUN pnpm run build:packages

# 2. build workspace
RUN pnpm --filter=@apps-examples/hono-rest build:fargate
# 3. pack workspace with pnpm deploy https://pnpm.io/cli/deploy
RUN pnpm --filter=@apps-examples/hono-rest --prod deploy /app/deployed-workspace

# ----- BUILD TARGET: for fargate -----
FROM base AS fargate
WORKDIR /app
COPY --from=build /app/deployed-workspace/ deployed-workspace/
EXPOSE 3000
WORKDIR /app/deployed-workspace
CMD [ "pnpm", "start:fargate" ]

# ----- BUILD TARGET: for local testing -----
# there's really no difference b/w local vs fargate docker build. 
FROM base AS local
WORKDIR /app
COPY --from=build /app/deployed-workspace/ deployed-workspace/
EXPOSE 3000
WORKDIR /app/deployed-workspace
CMD [ "pnpm", "start:local" ]
