import Order from "../models/order.js";
import Station from "../models/fuelStation.js";

// Add to your order controller
const verifyBlockchainPayment = async (txHash) => {
  const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_URL);
  const receipt = await provider.getTransactionReceipt(txHash);

  return {
    success: receipt.status === 1,
    blockNumber: receipt.blockNumber,
    from: receipt.from,
  };
};

// In your order creation logic
// if (method.crypto) {
//   const verification = await verifyBlockchainPayment(method.crypto.txHash);
//   if (!verification.success) {
//     throw new Error("Blockchain payment verification failed");
//   }
//   order.blockchainTx = method.crypto.txHash;
// }

export const addOrder = async (req, res) => {
  const { address, fuel, method, userId, stationId } = req.body;

  let order;
  try {
    order = await Order.create({
      address,
      fuel,
      method,
      userId,
      stationId,
      isCanceled: {
        status: false,
        message: "",
      },
      isAccepted: {
        status: false,
        message: "",
      },
      isDelivered: {
        status: false,
        message: "",
      },
    });
    if (!order) {
      return res.status(400).json({ message: "Order is not added" });
    }

    const station = await Station.findOne({ _id: stationId });
    console.log(stationId);
    let stationQuantity = station.quantity;
    console.log(stationQuantity);
    if (fuel.petrol) {
      stationQuantity = {
        ...stationQuantity,
        petrol: {
          ...stationQuantity.petrol,
          quantity: stationQuantity.petrol.quantity - fuel.petrol.quantity,
        },
      };
      if (stationQuantity.petrol.quantity < 0) {
        return res.status(400).json({
          status: "petrol",
          message: "Quantity not available",
        });
      }
    }
    if (fuel.diesel) {
      stationQuantity = {
        ...stationQuantity,
        diesel: {
          ...stationQuantity.diesel,
          quantity: stationQuantity.diesel.quantity - fuel.diesel.quantity,
        },
      };
      if (stationQuantity.diesel.quantity < 0) {
        return res.status(400).json({
          status: "diesel",
          message: "Quantity not available",
        });
      }
    }

    const updatedStation = await Station.updateOne(
      {
        _id: station._id,
      },
      {
        $set: {
          quantity: stationQuantity,
        },
      }
    );
    console.log(updatedStation, "qwe");
    if (!updatedStation) {
      return res.status(400).json({ message: "Quantity not found" });
    }

    await order.save();
    res
      .status(201)
      .json({ order, userId: order.userId, stationId: order.stationId });
  } catch (error) {
    console.log(error);

    res.status(400).json(error);
  }
};

export const updateOrder = async (req, res) => {
  const { address, fuel, method } = req.body;
  let order;
  try {
    order = await Order.findByIdAndUpdate(req.params.id, {
      address,
      fuel,
      method,
    });

    if (!order) {
      return res.status(400).json({ message: "Cannot get order with that id" });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(400).json(error);
  }
};

export const getOrders = async (req, res) => {
  let orders;
  try {
    orders = await Order.find({});
    if (!orders) {
      return res.status(400).json({ message: "Orders not found" });
    }

    res.status(200).json(orders);
  } catch (error) {
    res.status(200).json(error);
  }
};

export const getOrderById = async (req, res) => {
  let order;
  try {
    order = await Order.findById(req.params.id);
    if (!order) {
      return res
        .status(400)
        .json({ message: "Order with that id is not exists" });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(400).json(error);
  }
};

export const getOrderByFuelStationId = async (req, res) => {
  let order;
  try {
    order = await Order.find({ stationId: req.params.id });
    if (!order) {
      return res
        .status(400)
        .json({ message: "Order with that id is not exists" });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(400).json(error);
  }
};

export const getOrderByUserId = async (req, res) => {
  let order;
  try {
    order = await Order.find({ userId: req.params.id });
    if (!order) {
      return res
        .status(400)
        .json({ message: "Order with that id is not exists" });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(400).json(error);
  }
};

export const cancleOrder = async (req, res) => {
  const { id } = req.body;
  try {
    const updatedOrder = await Order.updateOne(
      { _id: id },
      {
        $set: {
          isCanceled: {
            status: true,
          },
        },
      }
    );

    if (!updatedOrder) {
      return res.status(400).json({ message: "Not updated" });
    }
    res.status(200).json({ message: "Order cancel successfully" });
  } catch (error) {
    res.status(400).json(error);
  }
};

export const acceptOrder = async (req, res) => {
  const { id } = req.body;
  try {
    const updatedOrder = await Order.updateOne(
      { _id: id },
      {
        $set: {
          isAccepted: {
            status: true,
          },
        },
      }
    );

    if (!updatedOrder) {
      return res.status(400).json({ message: "Not accepted" });
    }
    res.status(200).json({ message: "Order accepted successfully" });
  } catch (error) {
    res.status(400).json(error);
  }
};

export const deliveryOrder = async (req, res) => {
  const { id } = req.body;
  try {
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const updateOps = {
      $set: {
        "isDelivered.status": true,
      },
    };

    const [updatedStation, updatedOrder] = await Promise.all([
      Station.updateOne(
        { _id: order.stationId },
        {
          $inc: {
            "quantity.gas.quantity": order.fuel.gas
              ? -order.fuel.gas.quantity
              : 0,
          },
        }
      ),
      Order.updateOne({ _id: order._id }, updateOps),
    ]);

    res.status(200).json({
      message: "Order delivered and inventory updated successfully",
      order: updatedOrder,
      station: updatedStation,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
