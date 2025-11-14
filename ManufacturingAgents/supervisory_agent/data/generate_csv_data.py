import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# Your original data (sample)
original_data = {
    'timestamp': ['########'] * 18,
    'machine_id': ['M003', 'M004', 'M001', 'M003', 'M003', 'M004', 'M001', 'M001', 'M003', 'M002', 'M003', 'M003', 'M003', 'M003', 'M004', 'M001', 'M004', 'M004'],
    'machine_type': ['Welder', 'Conveyor', 'Drill', 'Conveyor', 'CNC', 'Drill', 'Welder', 'CNC', 'CNC', 'Welder', 'Welder', 'Conveyor', 'Drill', 'Welder', 'Welder', 'Drill', 'Welder', 'Welder'],
    'temperature': [78.3028789, 80.87707571, 71.31541791, 76.49619771, 73.61220202, 86.82031656, 91.70081258, 70.50532244, 75.77748576, 76.42137964, 78.27769244, 86.60067371, 75.94855178, 73.85148781, 75.83584768, 74.00092338, 76.89724922, 73.92573589],
    'vibration_level': [2.043750941, 2.175589831, 2.154465079, 2.245977576, 2.037302063, 7.222654797, 7.427526872, 1.592744738, 1.729796585, 1.710739979, 2.324016818, 6.947796745, 2.146191571, 2.32157896, 1.736215165, 2.104578536, 1.962447671, 2.254064631],
    'power_consumption': [23.0598555, 16.01281399, 15.75916416, 16.49026761, 18.06428629, 20.04057209, 27.74665328, 21.38709427, 18.30281478, 17.41462908, 16.7636791, 28.25262084, 16.34839445, 21.69279184, 21.8667195, 18.51359016, 17.97696982, 20.06131962],
    'pressure': [5.086075726, 5.412951759, 5.769405395, 4.618783815, 5.431250158, 4.965513161, 4.948130779, 4.385387724, 4.386084236, 4.601094017, 4.814458228, 4.566725446, 4.820436545, 4.837555857, 5.038701967, 4.354100055, 4.421792741, 5.144765708],
    'material_flow_rate': [20.01102601, 18.37573921, 17.11210668, 21.09068372, 20.86859236, 20.70063642, 21.95439263, 19.00245216, 17.85332879, 19.89495533, 19.47874955, 18.73655642, 19.88022627, 19.08259228, 17.24599207, 19.33823496, 18.29543725, 20.34747211],
    'cycle_time': [118.1465104, 123.0620583, 122.7540642, 118.9902697, 113.7498717, 121.528506, 122.7571827, 123.6291057, 121.7464639, 118.6444243, 124.9700102, 120.3292425, 117.6753849, 119.0967331, 111.2701548, 119.0887909, 123.4421826, 121.6989151],
    'error_rate': [0.883245895, 0.777072942, 0.757374176, 0.796480892, 0.813360983, 1, 1, 0.780686245, 0.718755667, 0.717481476, 0.846162157, 1, 0.769582871, 0.904796305, 0.811233497, 0.825167662, 0.75491789, 0.85555354],
    'downtime': [0, 38, 37, 39, 0, 0, 0, 0, 0, 0, 45, 0, 38, 45, 0, 41, 0, 0],
    'maintenance_flag': [0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
    'efficiency_score': [11.67541046, 3.292705781, 5.762582396, 0.851910751, 18.66390173, 0, 0, 21.91137555, 28.12441333, 28.25185238, 15.38378431, 0, 4.041712862, 0, 18.87665031, 0, 24.50821096, 14.44464604],
    'production_status': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
}

# ============================================
# 1. PRODUCTION DATA (for Production Agent + LSTM)
# ============================================
print("Creating production_data.csv...")

# Generate realistic timestamps (15-minute intervals)
start_time = datetime(2024, 11, 1, 8, 0)
timestamps = [start_time + timedelta(minutes=15*i) for i in range(len(original_data['machine_id']))]

production_df = pd.DataFrame({
    'timestamp': timestamps,
    'machine_id': original_data['machine_id'],
    'machine_type': original_data['machine_type'],
    'temperature': original_data['temperature'],
    'vibration_level': original_data['vibration_level'],
    'power_consumption': original_data['power_consumption'],
    'pressure': original_data['pressure'],
    'material_flow_rate': original_data['material_flow_rate'],
    'cycle_time': original_data['cycle_time'],
    'output_rate': [round(100 - (e * 10), 2) for e in original_data['error_rate']],  # Derived metric
    'quality_score': [round(100 - (e * 100), 2) for e in original_data['error_rate']],  # Quality based on error
    'downtime_minutes': original_data['downtime'],
    'efficiency_score': original_data['efficiency_score'],
    'status': ['maintenance' if m == 1 else 'operational' for m in original_data['maintenance_flag']],
    'shift': ['morning' if 8 <= t.hour < 16 else 'afternoon' if 16 <= t.hour < 24 else 'night' for t in timestamps]
})

production_df.to_csv('production_data.csv', index=False)
print(f"✓ Created production_data.csv ({len(production_df)} records)")

# ============================================
# 2. MAINTENANCE DATA (for Maintenance Agent)
# ============================================
print("\nCreating maintenance_data.csv...")

# Aggregate by machine for maintenance tracking
maintenance_df = pd.DataFrame({
    'machine_id': ['M001', 'M002', 'M003', 'M004'],
    'machine_type': ['Drill', 'Welder', 'Welder', 'Conveyor'],
    'last_maintenance': ['2024-10-15', '2024-11-01', '2024-10-20', '2024-11-05'],
    'hours_since_maintenance': [720, 288, 576, 192],
    'total_downtime_hours': [1.95, 0, 1.4, 0.63],
    'avg_temperature': [71.95, 76.42, 77.31, 83.44],
    'avg_vibration': [1.95, 1.71, 2.81, 3.63],
    'predicted_failure_prob': [0.15, 0.05, 0.25, 0.08],
    'next_maintenance_due': ['2024-11-20', '2024-12-01', '2024-11-15', '2024-12-10'],
    'maintenance_type': ['preventive', 'none', 'predictive', 'none'],
    'status': ['operational', 'operational', 'needs_attention', 'operational'],
    'priority': ['medium', 'low', 'high', 'low']
})

maintenance_df.to_csv('maintenance_data.csv', index=False)
print(f"✓ Created maintenance_data.csv ({len(maintenance_df)} records)")

# ============================================
# 3. QUALITY DATA (for Quality Control Agent)
# ============================================
print("\nCreating quality_data.csv...")

quality_records = []
for i, (ts, machine, error, eff, status) in enumerate(zip(
    timestamps, 
    original_data['machine_id'], 
    original_data['error_rate'],
    original_data['efficiency_score'],
    original_data['production_status']
)):
    quality_records.append({
        'timestamp': ts,
        'batch_id': f'B{1234 + i}',
        'machine_id': machine,
        'product_id': f'PX{str(i).zfill(3)}',
        'defect_rate': round(error * 100, 2),
        'quality_score': round(100 - (error * 100), 2),
        'defect_type': 'none' if error < 0.8 else 'surface_defect' if error < 0.9 else 'dimension',
        'inspection_status': 'passed' if error < 0.85 else 'failed',
        'inspector': f'QC-{(i % 3) + 1:02d}',
        'rework_required': 1 if error > 0.85 else 0
    })

quality_df = pd.DataFrame(quality_records)
quality_df.to_csv('quality_data.csv', index=False)
print(f"✓ Created quality_data.csv ({len(quality_df)} records)")

# ============================================
# 4. INVENTORY DATA (for Inventory Agent)
# ============================================
print("\nCreating inventory_data.csv...")

# Derive material consumption from production data
inventory_df = pd.DataFrame({
    'material_id': ['MAT001', 'MAT002', 'MAT003', 'MAT004', 'MAT005', 'MAT006'],
    'material_name': ['Steel Plate', 'Aluminum Rod', 'Welding Wire', 'Cutting Fluid', 'Bolts M10', 'Paint'],
    'current_stock': [5000, 3200, 1500, 800, 45000, 2500],
    'reorder_point': [1000, 800, 500, 200, 10000, 500],
    'optimal_stock': [8000, 5000, 3000, 1500, 80000, 5000],
    'unit_cost': [25.50, 18.75, 12.30, 8.50, 0.15, 45.00],
    'lead_time_days': [7, 5, 3, 2, 5, 10],
    'supplier': ['Supplier A', 'Supplier B', 'Supplier C', 'Supplier D', 'Supplier E', 'Supplier F'],
    'consumed_last_24h': [450, 280, 180, 45, 3200, 120],
    'status': ['sufficient', 'sufficient', 'low', 'sufficient', 'sufficient', 'low'],
    'reorder_needed': [0, 0, 1, 0, 0, 1],
    'last_updated': [datetime.now().strftime('%Y-%m-%d %H:%M:%S')] * 6
})

inventory_df.to_csv('inventory_data.csv', index=False)
print(f"✓ Created inventory_data.csv ({len(inventory_df)} records)")

# ============================================
# 5. LOGISTICS DATA (for Logistics Agent)
# ============================================
print("\nCreating logistics_data.csv...")

logistics_df = pd.DataFrame({
    'shipment_id': ['SH001', 'SH002', 'SH003', 'SH004', 'SH005', 'SH006'],
    'order_id': ['ORD1001', 'ORD1002', 'ORD1003', 'ORD1004', 'ORD1005', 'ORD1006'],
    'customer': ['Customer A', 'Customer B', 'Customer C', 'Customer D', 'Customer E', 'Customer A'],
    'product': ['Product X', 'Product Y', 'Product X', 'Product Z', 'Product Y', 'Product X'],
    'quantity': [1000, 500, 750, 300, 800, 1200],
    'scheduled_date': ['2024-11-20', '2024-11-18', '2024-11-22', '2024-11-25', '2024-11-19', '2024-11-30'],
    'status': ['scheduled', 'in_transit', 'preparing', 'scheduled', 'delivered', 'scheduled'],
    'priority': ['high', 'medium', 'high', 'low', 'medium', 'high'],
    'delivery_date': [None, '2024-11-18', None, None, '2024-11-19', None],
    'carrier': ['Carrier 1', 'Carrier 2', 'Carrier 1', 'Carrier 3', 'Carrier 2', 'Carrier 1'],
    'tracking_number': ['TRK123456', 'TRK123457', None, None, 'TRK123458', None],
    'estimated_cost': [450.00, 280.00, 350.00, 180.00, 320.00, 520.00]
})

logistics_df.to_csv('logistics_data.csv', index=False)
print(f"✓ Created logistics_data.csv ({len(logistics_df)} records)")

# ============================================
# SUMMARY
# ============================================
print("\n" + "="*60)
print("CSV FILES CREATED SUCCESSFULLY!")
print("="*60)
print("\n📊 Research-Aligned Features:")
print("  ✓ Time-series data for LSTM predictions (production_data.csv)")
print("  ✓ Real-time metrics for adaptive decision-making")
print("  ✓ Cross-domain data for MCP-based context sharing")
print("  ✓ KPIs for efficiency, quality, and downtime tracking")
print("  ✓ Status flags for autonomous agent coordination")
print("\n📁 Files Generated:")
print("  1. production_data.csv    - For Production Agent + LSTM")
print("  2. maintenance_data.csv   - For Maintenance Agent")
print("  3. quality_data.csv       - For Quality Control Agent")
print("  4. inventory_data.csv     - For Inventory Agent")
print("  5. logistics_data.csv     - For Logistics Agent")
print("\n🎯 Ready for Multi-Agent System Integration!")
print("="*60)