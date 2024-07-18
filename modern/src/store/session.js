import { createSlice } from "@reduxjs/toolkit";

const { reducer, actions } = createSlice({
  name: "session",
  initialState: {
    server: null,
    user: null,
    socket: null,
    positions: {},
    history: {},
    status: {},
  },
  reducers: {
    updateServer(state, action) {
      state.server = action.payload;
    },
    updateUser(state, action) {
      state.user = action.payload;
    },
    updateSocket(state, action) {
      state.socket = action.payload;
    },
    updateHistory(state, action) {
      state.history = action.payload;
    },
    updatePositions(state, action) {
      const liveRoutes =
        state.user.attributes.mapLiveRoutes ||
        state.server.attributes.mapLiveRoutes ||
        "none";
      const liveRoutesLimit =
        state.user.attributes["web.liveRouteLength"] ||
        state.server.attributes["web.liveRouteLength"] ||
        50;
      action.payload.forEach((position) => {
        // debugger
        state.positions[position.deviceId] = position;
        // console.log("Device Data From Socket =>", position);
        state.status[position.deviceId] = {
          tripStatus: position?.attributes?.motion,
        };
        if (liveRoutes !== "none") {
          const route = state.history[position.deviceId] || [];
          const last = route.at(-1);
          // if (!last || (last[0] !== position.longitude && last[1] !== position.latitude)) {
          state.history[position.deviceId] = [
            ...route,
            [position.longitude, position.latitude],
            ];
          // } else {
          //   state.history[position.deviceId] = [[position.longitude, position.latitude]];
          // }
        } else {
          state.history = {};
        }
      });
    },
  },
});

export { actions as sessionActions };
export { reducer as sessionReducer };
