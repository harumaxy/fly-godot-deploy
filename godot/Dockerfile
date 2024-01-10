FROM barichello/godot-ci as build
WORKDIR /app
COPY . /app
RUN godot --headless --export-debug "Linux/X11" /app/server.pck


FROM ubuntu:latest as app
WORKDIR /app
RUN apt-get update && apt-get install -y \
  curl \
  unzip
RUN curl -LO https://github.com/godotengine/godot-builds/releases/download/4.2.1-stable/Godot_v4.2.1-stable_linux.x86_64.zip \
  && unzip Godot_v4.2.1-stable_linux.x86_64.zip \
  && rm Godot_v4.2.1-stable_linux.x86_64.zip
RUN apt-get install -y fontconfig
COPY --from=build /app/server.pck /app/server.pck

# Godot can't listen the hostname, so we need to fix it to IP address
RUN export IP_ADDR=$(cat /etc/hosts | grep fly-global-services | awk '{print $1}')

ENTRYPOINT ["./Godot_v4.2.1-stable_linux.x86_64", "--headless", "--main-pack", "server.pck", "--server"]



